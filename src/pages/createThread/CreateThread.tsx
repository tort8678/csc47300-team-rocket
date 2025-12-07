import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from "../../components/header";
import Footer from "../../components/footer";
import apiService from '../../services/api';
import { useModal } from '../../contexts/ModalContext';
import CustomSelect, { type SelectOptionGroup } from '../../components/CustomSelect';
import '../../styles/createThread.css';
import { SendHorizontal, X, LoaderCircle, Upload, Trash, Save, Paperclip } from 'lucide-react';

const categoryGroups: SelectOptionGroup[] = [
    {
        label: "Academic",
        options: [
            { value: "academic-help", label: "Academic Help" },
            { value: "course-reviews", label: "Course Reviews" },
            { value: "research-projects", label: "Research & Projects" }
        ]
    },
    {
        label: "Campus Life",
        options: [
            { value: "events-activities", label: "Events & Activities" },
            { value: "clubs-organizations", label: "Clubs & Organizations" },
            { value: "sports-fitness", label: "Sports & Fitness" }
        ]
    },
    {
        label: "Career & Life",
        options: [
            { value: "career-internships", label: "Career & Internships" },
            { value: "housing-roommates", label: "Housing & Roommates" },
            { value: "buy-sell", label: "Buy & Sell" }
        ]
    },
    {
        label: "Entertainment",
        options: [
            { value: "gaming", label: "Gaming" },
            { value: "movies-tv", label: "Movies & TV" },
            { value: "music", label: "Music" }
        ]
    },
    {
        label: "General",
        options: [
            { value: "general-discussion", label: "General Discussion" },
            { value: "announcements", label: "Announcements" }
        ]
    }
];

export default function CreateThread() {
    const { showModal } = useModal();
    const navigate = useNavigate();
    const { threadId } = useParams<{ threadId?: string }>();
    const isEditMode = !!threadId;
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        content: ''
    });
    const [files, setFiles] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
    const [attachmentNames, setAttachmentNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [loadingThread, setLoadingThread] = useState(isEditMode);
    const [deletedAttachments, setDeletedAttachments] = useState<string[]>([]);
    
    useEffect(() => {
        document.title = isEditMode ? 'Edit Thread - DamIt' : 'Create Thread - DamIt';
        const token = localStorage.getItem('token');
        if (!token) {
            showModal('Please log in to create a thread.', 'info');
            navigate('/login');
            return;
        }

        // If editing, load the thread data
        if (isEditMode && threadId) {
            loadThreadData(threadId);
        }
    }, [navigate, isEditMode, threadId]);

    const loadThreadData = async (id: string) => {
        try {
            setLoadingThread(true);
            const response = await apiService.getThreadById(id);
            if (response.success && response.data) {
                setFormData({
                    title: response.data.title,
                    category: response.data.category,
                    content: response.data.content
                });
                
                // Load existing attachments
                if (response.data.attachments && response.data.attachments.length > 0) {
                    setExistingAttachments(response.data.attachments);
                    
                    // Fetch attachment filenames
                    const names: Record<string, string> = {};
                    await Promise.all(
                        response.data.attachments.map(async (fileId: string) => {
                            try {
                                const fileResponse = await fetch(`http://localhost:3000/api/threads/attachments/${fileId}/info`);
                                if (fileResponse.ok) {
                                    const fileData = await fileResponse.json();
                                    if (fileData.success && fileData.data) {
                                        names[fileId] = fileData.data.filename;
                                    }
                                }
                            } catch (error) {
                                console.error(`Error fetching attachment info for ${fileId}:`, error);
                            }
                        })
                    );
                    setAttachmentNames(names);
                }
            } else {
                showModal('Failed to load thread data.', 'error');
                navigate('/threads');
            }
        } catch (error) {
            console.error('Error loading thread:', error);
            showModal('Failed to load thread data.', 'error');
            navigate('/threads');
        } finally {
            setLoadingThread(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.category || !formData.title.trim() || !formData.content.trim()) {
            showModal('Please fill in all required fields.', 'warning');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showModal('Please log in to continue.', 'info');
                navigate('/login');
                return;
            }

            if (isEditMode && threadId) {
                // Update existing thread
                if (files.length > 0) {
                    // Use FormData if files are attached
                    const formDataToSend = new FormData();
                    formDataToSend.append('title', formData.title);
                    formDataToSend.append('content', formData.content);
                    formDataToSend.append('category', formData.category);
                    
                    // Append files
                    files.forEach((file) => {
                        formDataToSend.append(`files`, file);
                    });

                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/threads/${threadId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                            // Don't set Content-Type for FormData, browser will set it with boundary
                        },
                        body: formDataToSend
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to update thread');
                    }

                    const data = await response.json();
                    if (data.success) {
                        showModal('Thread updated successfully!', 'success');
                        navigate(`/thread/${threadId}`);
                    } else {
                        throw new Error(data.message || 'Failed to update thread');
                    }
                } else {
                    // Use JSON if no files but may have deleted attachments
                    if (deletedAttachments.length > 0) {
                        // Need to use FormData to send deletedAttachments
                        const formDataToSend = new FormData();
                        formDataToSend.append('title', formData.title);
                        formDataToSend.append('content', formData.content);
                        formDataToSend.append('category', formData.category);
                        formDataToSend.append('deletedAttachments', JSON.stringify(deletedAttachments));
                        
                        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/threads/${threadId}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: formDataToSend
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Failed to update thread');
                        }
                        
                        const data = await response.json();
                        if (data.success) {
                            showModal('Thread updated successfully!', 'success');
                            navigate(`/thread/${threadId}`);
                        } else {
                            throw new Error(data.message || 'Failed to update thread');
                        }
                    } else {
                        const response = await apiService.updateThread(threadId, {
                            title: formData.title,
                            content: formData.content,
                            category: formData.category
                        });

                        if (response.success) {
                            showModal('Thread updated successfully!', 'success');
                            navigate(`/thread/${threadId}`);
                        } else {
                            throw new Error(response.message || 'Failed to update thread');
                        }
                    }
                }
            } else {
                // Create new thread
                if (files.length > 0) {
                    // Use FormData if files are attached
                    const formDataToSend = new FormData();
                    formDataToSend.append('title', formData.title);
                    formDataToSend.append('content', formData.content);
                    formDataToSend.append('category', formData.category);
                    
                    // Append files
                    files.forEach((file) => {
                        formDataToSend.append(`files`, file);
                    });

                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/threads`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                            // Don't set Content-Type for FormData, browser will set it with boundary
                        },
                        body: formDataToSend
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to create thread');
                    }

                    const data = await response.json();
                    if (data.success) {
                        showModal('Thread created successfully! It will be reviewed by an admin before being published.', 'success');
                        navigate('/threads');
                    } else {
                        throw new Error(data.message || 'Failed to create thread');
                    }
                } else {
                    // Use JSON if no files
                    const response = await apiService.createThread({
                        title: formData.title,
                        content: formData.content,
                        category: formData.category
                    });

                    if (response.success) {
                        showModal('Thread created successfully! It will be reviewed by an admin before being published.', 'success');
                        navigate('/threads');
                    } else {
                        throw new Error(response.message || 'Failed to create thread');
                    }
                }
            }
        } catch (error: any) {
            console.error('Error saving thread:', error);
            showModal(error.message || 'An error occurred while saving the thread. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        if (isEditMode && threadId) {
            navigate(`/thread/${threadId}`);
        } else {
            navigate(-1);
        }
    };

    if (loadingThread) {
        return (
            <div>
                <Header />
                <main className="container">
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffffb3' }}>
                        Loading thread data...
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <Header />

            <main className="container">
                <div className="page-header">
                    <h1>{isEditMode ? 'Edit Thread' : 'Create New Thread'}</h1>
                    <p>{isEditMode ? 'Update your thread content' : 'Start a new discussion in the community'}</p>
                </div>

                <div className="form-container">
                    <form id="newThreadForm" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <p className="helper-text">Choose a clear, descriptive title that summarizes your topic</p>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                placeholder="Enter a descriptive title for your thread"
                                required
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <p className="helper-text">Choose the most relevant category to help others find your post</p>
                            <CustomSelect
                                id="category"
                                name="category"
                                required
                                value={formData.category}
                                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                optionGroups={categoryGroups}
                                placeholder="Select a category"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="content">Content</label>
                            <p className="helper-text">Provide detailed information and context to help others understand and respond to your post</p>
                            <textarea
                                id="content"
                                name="content"
                                placeholder="Write your post content here..."
                                required
                                value={formData.content}
                                onChange={handleInputChange}
                                rows={8}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="files">Attach Files (Optional)</label>
                            <p className="helper-text">
                                {isEditMode 
                                    ? "You can add new files. New files will be added to the existing attachments."
                                    : "You can attach files to your thread (images, documents, etc.)"
                                }
                            </p>
                            
                            {isEditMode && existingAttachments.length > 0 && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '1rem',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '8px'
                                }}>
                                    <p style={{ color: '#fdcffa', marginBottom: '0.5rem', fontWeight: 500 }}>
                                        Current Attachments ({existingAttachments.length}):
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {existingAttachments.map((fileId, index) => {
                                            const fileName = attachmentNames[fileId] || `Attachment ${index + 1}`;
                                            return (
                                                <div
                                                    key={fileId}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem',
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        borderRadius: '4px',
                                                        color: '#ffffffb3',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                        <Paperclip size={16} />
                                                        <span>{fileName}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setExistingAttachments(prev => prev.filter(id => id !== fileId));
                                                            setDeletedAttachments(prev => [...prev, fileId]);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#ff6b6b',
                                                            cursor: 'pointer',
                                                            padding: '0.25rem',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            <div style={{ 
                                border: '2px dashed rgba(255, 255, 255, 0.3)', 
                                borderRadius: '8px', 
                                padding: '1rem',
                                background: 'rgba(0, 0, 0, 0.2)'
                            }}>
                                <input
                                    type="file"
                                    id="files"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="files"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        cursor: 'pointer',
                                        color: '#fdcffa',
                                        marginBottom: files.length > 0 ? '1rem' : '0'
                                    }}
                                >
                                    <Upload size={20} />
                                    <span>Upload files</span>
                                </label>
                                {files.length > 0 && (
                                    <div style={{ marginTop: '1rem' }}>
                                        {files.map((file, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.5rem',
                                                    background: 'rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '4px',
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                <span style={{ color: 'white', fontSize: '0.875rem' }}>
                                                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#ff6b6b',
                                                        cursor: 'pointer',
                                                        padding: '0.25rem'
                                                    }}
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleCancel}
                            >
                                <X />
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? <LoaderCircle className='loading' /> : (isEditMode ? <Save /> : <SendHorizontal />)}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}
