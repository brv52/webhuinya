import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import * as api from '../api';

export default function Blog() {
  const { user } = useContext(AppContext);
  const [blogs, setBlogs] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  const loadBlogs = async () => {
    const data = await api.apiGetBlogs();
    setBlogs(data);
  };

  useEffect(() => { loadBlogs(); }, []);

  const handleLike = async (id) => {
    if (!user) return alert("Identify yourself to appreciate.");
    await api.apiLikeBlog(id);
    loadBlogs();
  };

  const handleCommentSubmit = async (e, blogId) => {
    e.preventDefault();
    if (!user) return alert("Identify yourself to respond.");
    const text = commentInputs[blogId];
    if (!text || text.trim() === '') return;
    await api.apiAddComment(blogId, text);
    setCommentInputs(prev => ({ ...prev, [blogId]: '' }));
    loadBlogs();
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <header className="mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 block">Archive</span>
            <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-slate-900 leading-[0.8]">
                The <br/> <span className="text-slate-400">Journal.</span>
            </h2>
        </header>
        
        <div className="space-y-20">
          {blogs.map(blog => (
            <article 
                key={blog.id} 
                className="group bg-white rounded-[2.5rem] p-8 md:p-14 shadow-sm border border-slate-100/50 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex justify-between items-start mb-10">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    Vol. {blog.id} — Editorial
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mb-8 leading-none">
                {blog.title}
              </h3>
              
              <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium whitespace-pre-line border-l-2 border-slate-100 pl-6">
                {blog.content}
              </p>
              
              {/* Interaction Bar */}
              <div className="flex items-center gap-10 mb-14 pb-10 border-b border-slate-50">
                <button 
                    onClick={() => handleLike(blog.id)} 
                    className="flex items-center gap-3 group/btn"
                >
                  <div className="bg-slate-900 text-white w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 group-hover/btn:scale-110 group-hover/btn:bg-red-500">
                    {/* Minimalist Heart Icon */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">{blog.likes}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Appreciations</span>
                  </div>
                </button>

                <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900">{blog.comments.length}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Discussion points</span>
                </div>
              </div>

              {/* Responses / Comments Section */}
              <div className="bg-slate-50 rounded-[2rem] p-8 md:p-12">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 flex items-center gap-4">
                    Responses <span className="h-[1px] flex-1 bg-slate-200"></span>
                </h4>
                
                <div className="space-y-8 mb-12">
                {blog.comments.map(c => (
                    <div key={c.id} className="flex flex-col border-l-2 border-slate-100 pl-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">
                        {c.username}
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-xl whitespace-normal break-words">
                        {c.text}
                    </p>
                    </div>
                ))}
                </div>

                {user ? (
                  <form onSubmit={(e) => handleCommentSubmit(e, blog.id)} className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Add to the record..." 
                        className="flex-1 bg-white p-5 rounded-2xl text-xs font-bold outline-none focus:ring-2 ring-slate-900 transition shadow-inner border border-slate-100"
                        value={commentInputs[blog.id] || ''} 
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [blog.id]: e.target.value }))} 
                    />
                    <button 
                        type="submit" 
                        className="bg-slate-900 text-white px-10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg active:scale-95"
                    >
                        Post
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Login to participate in the conversation</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}