import React, { useState, useEffect } from 'react';
import { 
    Library, 
    Plus, 
    Link as LinkIcon, 
    FileText, 
    ExternalLink, 
    X,
    FolderPlus,
    Loader2
} from 'lucide-react';
import { 
    getCollections, 
    createCollection, 
    getResources, 
    addResource 
} from '../api/resource.api';

const Resources = () => {
    const [collections, setCollections] = useState([]);
    const [activeCollection, setActiveCollection] = useState(null);
    const [resources, setResources] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Modals state
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    
    // Form state
    const [collectionTitle, setCollectionTitle] = useState('');
    const [newResource, setNewResource] = useState({
        title: '',
        type: 'link',
        url: '',
        notes: ''
    });

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const { data } = await getCollections();
            if (data.success) {
                setCollections(data.data);
                if (data.data.length > 0 && !activeCollection) {
                    handleCollectionSelect(data.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch collections', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCollectionSelect = async (collection) => {
        setActiveCollection(collection);
        try {
            const { data } = await getResources(collection._id);
            if (data.success) {
                setResources(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch resources', error);
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            const { data } = await createCollection({ title: collectionTitle });
            if (data.success) {
                setCollections([data.data, ...collections]);
                setCollectionTitle('');
                setIsCollectionModalOpen(false);
                handleCollectionSelect(data.data);
            }
        } catch (error) {
            console.error('Failed to create collection', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        if (!activeCollection) return;
        
        try {
            setActionLoading(true);
            const { data } = await addResource({
                ...newResource,
                collectionId: activeCollection._id
            });
            if (data.success) {
                setResources([data.data, ...resources]);
                setNewResource({ title: '', type: 'link', url: '', notes: '' });
                setIsResourceModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to add resource', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && collections.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full md:flex-row gap-6">
            {/* Left Sidebar: Collections */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Library className="w-5 h-5 text-primary-600" />
                        Collections
                    </h2>
                    <button 
                        onClick={() => setIsCollectionModalOpen(true)}
                        className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-[#1E1E1E] rounded-lg transition-colors"
                    >
                        <FolderPlus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {collections.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-100 dark:border-[#2A2A2A]">
                            No collections yet. Click + to create one.
                        </div>
                    ) : (
                        collections.map(col => (
                            <button
                                key={col._id}
                                onClick={() => handleCollectionSelect(col)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                                    activeCollection?._id === col._id 
                                        ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-500/30' 
                                        : 'bg-white border-gray-100 hover:border-gray-200 dark:bg-[#1E1E1E] dark:border-[#2A2A2A] dark:hover:border-gray-700'
                                }`}
                            >
                                <span className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">{col.title}</span>
                                <span className="text-xs text-gray-400 mt-1 block">
                                    {new Date(col.createdAt).toLocaleDateString()}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Pane: Resources in Active Collection */}
            <div className="flex-1 bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl flex flex-col overflow-hidden">
                {activeCollection ? (
                    <>
                        <div className="p-6 border-b border-gray-100 dark:border-[#2A2A2A] flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {activeCollection.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {resources.length} resources saved
                                </p>
                            </div>
                            <button
                                onClick={() => setIsResourceModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add Resource
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {resources.length === 0 ? (
                                <div className="text-center py-12">
                                    <Library className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        This collection is empty.
                                    </p>
                                </div>
                            ) : (
                                resources.map(resource => (
                                    <div 
                                        key={resource._id} 
                                        className="p-4 border border-gray-100 dark:border-[#2A2A2A] rounded-xl hover:border-gray-200 dark:hover:border-gray-700 transition flex gap-4"
                                    >
                                        <div className="mt-1">
                                            {resource.type === 'link' ? (
                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                                    <LinkIcon className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                                {resource.title}
                                            </h4>
                                            
                                            {resource.type === 'link' && resource.url && (
                                                <a 
                                                    href={resource.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline mt-1"
                                                >
                                                    {resource.url}
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                            
                                            {resource.notes && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-[#121212] p-3 rounded-lg border border-gray-100 dark:border-[#2A2A2A]">
                                                    {resource.notes}
                                                </p>
                                            )}
                                            
                                            <div className="text-xs text-gray-400 mt-3 font-medium">
                                                Added {new Date(resource.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        Select or create a collection to get started.
                    </div>
                )}
            </div>

            {/* Modals Overlay Base (simulated with standard fixed positioning to avoid complex dependencies) */}
            {(isCollectionModalOpen || isResourceModalOpen) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    
                    {/* Collection Modal */}
                    {isCollectionModalOpen && (
                        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">New Collection</h3>
                                <button onClick={() => setIsCollectionModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateCollection}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Collection Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={collectionTitle}
                                        onChange={(e) => setCollectionTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#2A2A2A] bg-white dark:bg-[#121212] text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Data Structures"
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCollectionModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#2A2A2A] rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading || !collectionTitle}
                                        className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Create Collection
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Resource Modal */}
                    {isResourceModalOpen && (
                        <div className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-6 w-full max-w-lg shadow-xl shrink-0 overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add to {activeCollection?.title}</h3>
                                <button onClick={() => setIsResourceModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddResource} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Resource Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newResource.title}
                                        onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#2A2A2A] bg-white dark:bg-[#121212] text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-600 outline-none transition-all"
                                        placeholder="e.g. JavaScript Async Await Guide"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-gray-900 dark:text-white cursor-pointer">
                                            <input 
                                                type="radio" 
                                                checked={newResource.type === 'link'} 
                                                onChange={() => setNewResource({...newResource, type: 'link'})}
                                                className="text-primary-600 focus:ring-primary-600"
                                            />
                                            Web Link
                                        </label>
                                        <label className="flex items-center gap-2 text-gray-900 dark:text-white cursor-pointer">
                                            <input 
                                                type="radio" 
                                                checked={newResource.type === 'note'} 
                                                onChange={() => setNewResource({...newResource, type: 'note'})}
                                                className="text-primary-600 focus:ring-primary-600"
                                            />
                                            Text Note
                                        </label>
                                    </div>
                                </div>

                                {newResource.type === 'link' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            URL
                                        </label>
                                        <input
                                            type="url"
                                            required
                                            value={newResource.url}
                                            onChange={(e) => setNewResource({...newResource, url: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2A2A2A] bg-white dark:bg-[#121212] text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-600 outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notes / Content {newResource.type === 'note' && '(Required)'}
                                    </label>
                                    <textarea
                                        required={newResource.type === 'note'}
                                        value={newResource.notes}
                                        onChange={(e) => setNewResource({...newResource, notes: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-[#2A2A2A] bg-white dark:bg-[#121212] text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-600 outline-none transition-all h-32 resize-none"
                                        placeholder={newResource.type === 'link' ? "Optional notes about this link..." : "Enter your study notes here..."}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2A2A2A]">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsResourceModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-[#2A2A2A] rounded-xl transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={actionLoading || !newResource.title || (newResource.type === 'link' && !newResource.url)}
                                        className="px-4 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save Resource
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Resources;
