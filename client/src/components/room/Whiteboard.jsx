import React, { useRef, useState, useEffect } from 'react';
import { Trash2, PenTool, Square, Circle, Minus, Undo2, Redo2, Eraser } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const Whiteboard = ({ roomId }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#0ea5e9'); // Primary color
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState('pen'); // pen, eraser, rect, circle, line
    
    const socket = useSocket();
    
    const contextRef = useRef(null);
    const startPosRef = useRef({ x: 0, y: 0 }); // for shapes
    const lastPosRef = useRef({ x: 0, y: 0 }); // for pen

    // Undo/Redo history
    const historyRef = useRef([]);
    const [historyStep, setHistoryStep] = useState(0);
    // Snapshot taken on mousedown for shape preview
    const snapshotRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const rect = canvas.parentElement.getBoundingClientRect();
        
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;

        // Save initial blank state
        saveState();

        const handleResize = () => {
            const newRect = canvas.parentElement.getBoundingClientRect();
            // In a real app we'd preserve drawing data on resize. Keeping it simple here.
            canvas.width = newRect.width;
            canvas.height = newRect.height;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            // Restore last state if possible
            restoreState(historyStep);
        };
        window.addEventListener('resize', handleResize);

        if (socket) {
            socket.on('whiteboard:draw:received', handleRemoteDraw);
            socket.on('whiteboard:clear:received', clearCanvasLocal);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (socket) {
                socket.off('whiteboard:draw:received');
                socket.off('whiteboard:clear:received');
            }
        };
    }, [socket]);

    const saveState = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Remove redo states if we draw a new thing after an undo
        const newHistory = historyRef.current.slice(0, historyStep + 1);
        newHistory.push(contextRef.current.getImageData(0, 0, canvas.width, canvas.height));
        
        // Keep max 20 states
        if (newHistory.length > 20) newHistory.shift();
        
        historyRef.current = newHistory;
        setHistoryStep(newHistory.length - 1);
    };

    const restoreState = (step) => {
        if (step < 0 || step >= historyRef.current.length) return;
        const canvas = canvasRef.current;
        if (canvas && contextRef.current) {
            contextRef.current.putImageData(historyRef.current[step], 0, 0);
            setHistoryStep(step);
        }
    };

    const handleUndo = () => {
        if (historyStep > 0) {
            restoreState(historyStep - 1);
            // In a full implementation, we'd emit undo events. For now, local only or send full image.
        }
    };

    const handleRedo = () => {
        if (historyStep < historyRef.current.length - 1) {
            restoreState(historyStep + 1);
        }
    };

    const handleRemoteDraw = (drawData) => {
        if (!contextRef.current) return;
        const ctx = contextRef.current;
        const { type, x0, y0, x1, y1, strokeColor, size } = drawData;
        
        const prevColor = ctx.strokeStyle;
        const prevSize = ctx.lineWidth;
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = size;

        ctx.beginPath();
        if (type === 'pen' || type === 'eraser') {
            if (type === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = size * 2; // Make eraser slightly bigger
            }
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        } else if (type === 'line') {
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
        } else if (type === 'rect') {
            ctx.rect(x0, y0, x1 - x0, y1 - y0);
            ctx.stroke();
        } else if (type === 'circle') {
            const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
            ctx.arc(x0, y0, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.closePath();
        
        ctx.strokeStyle = prevColor; 
        ctx.lineWidth = prevSize;
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        startPosRef.current = { x: offsetX, y: offsetY };
        lastPosRef.current = { x: offsetX, y: offsetY };
        
        const canvas = canvasRef.current;
        snapshotRef.current = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
        
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        saveState();
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = contextRef.current;
        
        if (tool === 'pen' || tool === 'eraser') {
            const drawData = {
                type: tool,
                x0: lastPosRef.current.x,
                y0: lastPosRef.current.y,
                x1: offsetX,
                y1: offsetY,
                strokeColor: color,
                size: brushSize
            };
            handleRemoteDraw(drawData);
            if (socket && roomId) socket.emit('whiteboard:draw', { roomId, strokeData: drawData });
            lastPosRef.current = { x: offsetX, y: offsetY };
        } else {
            // Shape preview
            ctx.putImageData(snapshotRef.current, 0, 0); // Restore snapshot
            
            const drawData = {
                type: tool,
                x0: startPosRef.current.x,
                y0: startPosRef.current.y,
                x1: offsetX,
                y1: offsetY,
                strokeColor: color,
                size: brushSize
            };
            
            // Draw shape locally
            handleRemoteDraw(drawData);
            
            // Emit only if it's the final shape (on mouseup). 
            // Real-time shape dragging over socket is spammy. Let's do it on mouseup.
            // Wait, this is `mousemove`. We don't emit shapes here. 
            // We'll attach a mouseup handler specifically for emitting the final shape.
        }
    };

    const handleMouseUp = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = e.nativeEvent;
        
        if (tool !== 'pen' && tool !== 'eraser') {
            const drawData = {
                type: tool,
                x0: startPosRef.current.x,
                y0: startPosRef.current.y,
                x1: offsetX,
                y1: offsetY,
                strokeColor: color,
                size: brushSize
            };
            if (socket && roomId) socket.emit('whiteboard:draw', { roomId, strokeData: drawData });
        }
        finishDrawing();
    };

    const clearCanvasLocal = () => {
        const canvas = canvasRef.current;
        if (canvas && contextRef.current) {
            contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
            saveState();
        }
    };

    const clearCanvas = () => {
        clearCanvasLocal();
        if (socket && roomId) {
            socket.emit('whiteboard:clear', { roomId });
        }
    };

    const tools = [
        { id: 'pen', icon: PenTool, title: 'Pen' },
        { id: 'eraser', icon: Eraser, title: 'Eraser' },
        { id: 'line', icon: Minus, title: 'Line' },
        { id: 'rect', icon: Square, title: 'Rectangle' },
        { id: 'circle', icon: Circle, title: 'Circle' }
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1E1E1E] overflow-x-auto custom-scrollbar">
                <div className="flex items-center gap-2">
                    {tools.map(t => (
                        <button 
                            key={t.id}
                            title={t.title}
                            onClick={() => setTool(t.id)}
                            className={`p-2 rounded-lg transition-colors ${tool === t.id ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-[#2A2A2A]'}`}
                        >
                            <t.icon size={18} />
                        </button>
                    ))}
                    
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>
                    
                    <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                        title="Color Picker"
                    />
                    
                    <div className="flex items-center gap-2 ml-2">
                        <span className="text-xs text-gray-500">Size:</span>
                        <input 
                            type="range" 
                            min="1" max="20" 
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-20 accent-primary-500"
                        />
                    </div>
                    
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>

                    <button 
                        onClick={handleUndo}
                        disabled={historyStep <= 0}
                        className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-[#2A2A2A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo"
                    >
                        <Undo2 size={18} />
                    </button>
                    <button 
                        onClick={handleRedo}
                        disabled={historyStep >= historyRef.current.length - 1}
                        className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-[#2A2A2A] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo"
                    >
                        <Redo2 size={18} />
                    </button>
                </div>
                
                <button 
                    onClick={clearCanvas}
                    className="flex items-center gap-2 p-2 px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors shrink-0 ml-4"
                >
                    <Trash2 size={16} /> Clear
                </button>
            </div>
            
            {/* Canvas Container */}
            <div className="flex-1 w-full relative touch-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px]">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={handleMouseUp}
                    onMouseOut={finishDrawing}
                    onMouseMove={draw}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                />
            </div>
        </div>
    );
};

export default Whiteboard;
