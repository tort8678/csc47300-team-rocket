import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "../../components/header";
import Footer from "../../components/footer";
import '../../styles/createThread.css';
import type { Thread } from "../../types/types";

type CategoryGroup = {
    label: string;
    options: Array<{
        value: string;
        label: string;
    }>;
};

const categoryGroups: CategoryGroup[] = [
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
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Omit<Thread, 'id' | 'createdAt'>>({
        title: '',
        category: '',
        content: '',
        author: '',
        replies: 0,
        views: 0
    });

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            alert('Please log in to create a thread.');
            navigate('/login');
        }
        else {
            // prefill author from logged in user
            setFormData(prev => ({ ...prev, author: loggedInUser }));
        }
    }, [navigate]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!formData.category || !formData.title.trim() || !formData.content.trim() || !formData.author) {
            alert('Please fill in all required fields.');
            return;
        }

        const threadInfo: Thread = {
            ...formData,
            createdAt: new Date(),
            id: `thread_${Date.now()}`
        };

        try {
            localStorage.setItem(threadInfo.id, JSON.stringify(threadInfo));
            alert('Thread created successfully!');
            navigate('/threads');
        } catch (error) {
            console.error('Error creating thread:', error);
            alert('An error occurred while creating the thread. Please try again.');
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
        navigate(-1);
    };

    return (
        <div>
            <Header />

            <main className="container">
                <div className="page-header">
                    <h1>Create New Thread</h1>
                    <p>Start a new discussion in the community</p>
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
                            <label htmlFor="author">Author</label>
                            <p className="helper-text">You are posting as the logged-in user</p>
                            <input
                                type="text"
                                id="author"
                                name="author"
                                placeholder="author"
                                required
                                value={formData.author}
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <p className="helper-text">Choose the most relevant category to help others find your post</p>
                            <select 
                                id="category" 
                                name="category" 
                                required 
                                value={formData.category}
                                onChange={handleInputChange}
                            >
                                <option value="">Select a category</option>
                                {categoryGroups.map(group => (
                                    <optgroup key={group.label} label={group.label}>
                                        {group.options.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
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

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
}