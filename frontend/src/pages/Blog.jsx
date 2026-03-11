// src/pages/Blog.jsx
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { apiGetBlogs, apiLikeBlog, apiAddComment } from '../mockApi';
import { Link } from 'react-router-dom';

export default function Blog() {
  const { user } = useContext(AppContext);
  const [blogs, setBlogs] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  const loadBlogs = async () => {
    const data = await apiGetBlogs();
    setBlogs(data);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleLike = async (id) => {
    if (!user) return alert("Please log in to like posts!");
    await apiLikeBlog(id);
    loadBlogs();
  };

  const handleCommentSubmit = async (e, blogId) => {
    e.preventDefault();
    if (!user) return alert("Please log in to comment!");
    const text = commentInputs[blogId];
    if (!text || text.trim() === '') return;

    await apiAddComment(blogId, user.username, text);
    setCommentInputs(prev => ({ ...prev, [blogId]: '' })); // clear input
    loadBlogs();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Shop Blog</h2>
      
      {blogs.length === 0 ? (
        <p className="text-gray-500">No blog posts yet.</p>
      ) : (
        <div className="space-y-8">
          {blogs.map(blog => (
            <div key={blog.id} className="bg-white p-6 rounded shadow border-t-4 border-blue-500">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{blog.title}</h3>
              <p className="text-gray-600 mb-6 whitespace-pre-line">{blog.content}</p>
              
              <div className="flex items-center space-x-4 mb-6 border-b pb-4">
                <button 
                  onClick={() => handleLike(blog.id)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1 rounded"
                >
                  <span>👍 Like</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-sm border">{blog.likes}</span>
                </button>
                <span className="text-gray-500 text-sm">{blog.comments.length} Comments</span>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Comments</h4>
                
                {blog.comments.length > 0 ? (
                  <ul className="space-y-3 mb-4">
                    {blog.comments.map(c => (
                      <li key={c.id} className="bg-gray-50 p-3 rounded text-sm">
                        <span className="font-bold text-gray-800 mr-2">{c.username}:</span>
                        <span className="text-gray-600">{c.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 mb-4">Be the first to comment!</p>
                )}

                {user ? (
                  <form onSubmit={(e) => handleCommentSubmit(e, blog.id)} className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      className="border p-2 rounded flex-1 text-sm"
                      value={commentInputs[blog.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [blog.id]: e.target.value }))}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700">
                      Post
                    </button>
                  </form>
                ) : (
                  <p className="text-sm text-gray-500 italic"><Link to="/login" className="text-blue-600 underline">Log in</Link> to join the conversation.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}