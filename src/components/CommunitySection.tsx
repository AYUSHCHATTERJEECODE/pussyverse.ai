import React, { useState } from "react";
import { MessageSquare, Heart, Share2, Plus, Sparkles, Send, Award, Users, MapPin, Tag } from "lucide-react";
import { CommunityPost } from "../types";
import { motion, AnimatePresence } from "motion/react";

export default function CommunitySection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: "1",
      authorName: "Charlotte (Maine Coon Breeder)",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
      authorRole: "Expert Breeder",
      content: "Just weighed Zeus, my 10-month-old Maine Coon. He officially hit 8.2 kg! Is anyone else tracking massive growth spurts? Check out his majestic fluff!",
      imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&q=80",
      likes: 42,
      likedByMe: false,
      comments: [
        { id: "c1", author: "Markus", authorAvatar: "", content: "Unbelievable size! Beautiful cat.", timestamp: "2 hours ago" },
        { id: "c2", author: "Sasha", authorAvatar: "", content: "What a king! What diet do you feed him?", timestamp: "1 hour ago" },
      ],
      category: "Breed Specific",
      timestamp: "3 hours ago",
    },
    {
      id: "2",
      authorName: "Aiden (Veterinary Technician)",
      authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80",
      authorRole: "Licensed Vet Tech",
      content: "Reminder to all cat parents in hot summer zones: Keep multiple hydration stations. Water fountains with running water encourage cats to drink up to 3x more. This is crucial for feline bladder health!",
      likes: 85,
      likedByMe: true,
      comments: [
        { id: "c3", author: "Elena", content: "Thank you Aiden! Ordering a fountain immediately on the PurrVerse market.", timestamp: "4 hours ago" }
      ],
      category: "Q&A & Advice",
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      authorName: "Oliver K.",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      content: "URGENT: Lost orange tabby named Rusty near Green Park Avenue. He is wearing a red collar, is neutered, and is very timid. Please message me if spotted!",
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
      likes: 124,
      likedByMe: false,
      comments: [],
      category: "Lost & Found",
      timestamp: "10 hours ago",
    },
  ]);

  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("Q&A & Advice");
  const [showAddPost, setShowAddPost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeCommentText, setActiveCommentText] = useState("");

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const liked = !post.likedByMe;
          return {
            ...post,
            likedByMe: liked,
            likes: liked ? post.likes + 1 : post.likes - 1,
          };
        }
        return post;
      })
    );
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: String(Date.now()),
      authorName: "You (Care Circle Member)",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
      authorRole: "Premium Parent",
      content: newPostContent,
      likes: 0,
      likedByMe: false,
      comments: [],
      category: newPostCategory,
      timestamp: "Just now",
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setShowAddPost(false);
  };

  const handleAddComment = (postId: string) => {
    if (!activeCommentText.trim()) return;

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: String(Date.now()),
                author: "You",
                content: activeCommentText,
                timestamp: "Just now",
              },
            ],
          };
        }
        return post;
      })
    );
    setActiveCommentText("");
  };

  const categories = ["All", "Breed Specific", "Q&A & Advice", "Lost & Found"];

  const filteredPosts = posts.filter((p) => {
    if (activeCategory === "All") return true;
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="bg-brand-matte border border-neutral-900 rounded-3xl p-6 sm:p-8 text-brand-warm shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-6 mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold tracking-tight text-brand-warm flex items-center gap-2">
            🌍 Global Cat Community
          </h2>
          <p className="text-xs text-neutral-500 font-sans mt-0.5">
            Discuss cat nutrition, health, lost & found, and share beautiful pictures with owners worldwide.
          </p>
        </div>

        <button
          onClick={() => setShowAddPost(!showAddPost)}
          className="px-4 py-2.5 rounded-full bg-brand-gold text-brand-matte text-xs tracking-wide font-display font-semibold flex items-center gap-1.5 hover:bg-yellow-500 transition-all cursor-pointer shadow-lg shrink-0"
        >
          <Plus className="w-4 h-4" /> Share a Story
        </button>
      </div>

      {/* Category selector */}
      <div className="flex gap-2 border-b border-neutral-900/60 pb-4 mb-6 overflow-x-auto scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-medium font-sans whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat
                ? "bg-neutral-900 text-brand-gold border border-brand-gold/30 shadow-md"
                : "text-neutral-500 hover:text-brand-warm"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {showAddPost && (
              <motion.form
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleAddPost}
                className="p-5 rounded-2xl border border-brand-gold/20 bg-neutral-950/40 space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
                  <p className="text-xs uppercase font-mono tracking-wider text-brand-gold">
                    What's on your mind?
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddPost(false)}
                    className="text-[10px] uppercase font-mono text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex gap-3 items-center">
                  <span className="text-xs text-neutral-400">Category:</span>
                  <select
                    value={newPostCategory}
                    onChange={(e) => setNewPostCategory(e.target.value)}
                    className="bg-neutral-950 text-brand-warm border border-neutral-800 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-gold"
                  >
                    <option value="Breed Specific">Breed Specific</option>
                    <option value="Q&A & Advice">Q&A & Advice</option>
                    <option value="Lost & Found">Lost & Found</option>
                  </select>
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Share a story, vaccine tip, or breed question..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                />

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-gold text-brand-matte font-display font-semibold text-xs uppercase tracking-wider hover:bg-yellow-500 transition cursor-pointer"
                >
                  Post Story
                </button>
              </motion.form>
            )}

            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-950/20 border border-neutral-900 rounded-2xl p-6 space-y-4"
              >
                {/* Post Author info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-800"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-brand-warm font-display">
                          {post.authorName}
                        </span>
                        {post.authorRole && (
                          <span className="px-1.5 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/15 text-[8px] uppercase tracking-wide font-mono text-brand-gold">
                            {post.authorRole}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5">
                        {post.timestamp}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-850 text-[9px] uppercase tracking-wider font-mono text-neutral-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-brand-gold" /> {post.category}
                  </span>
                </div>

                {/* Content */}
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  {post.content}
                </p>

                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post attachment"
                    className="w-full max-h-[350px] object-cover rounded-xl border border-neutral-900 mt-2"
                  />
                )}

                {/* Footer buttons */}
                <div className="flex items-center gap-6 pt-3 border-t border-neutral-900/60 text-xs">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 hover:text-brand-gold transition cursor-pointer ${
                      post.likedByMe ? "text-brand-gold font-semibold" : "text-neutral-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-current" : ""}`} /> {post.likes} Likes
                  </button>

                  <button
                    onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-neutral-500 hover:text-brand-gold transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" /> {post.comments.length} Comments
                  </button>

                  <button className="flex items-center gap-1.5 text-neutral-500 hover:text-brand-gold transition cursor-pointer ml-auto">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Comment Section Panel */}
                {selectedPostId === post.id && (
                  <div className="pt-4 border-t border-neutral-900 space-y-4">
                    <div className="space-y-3.5">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-900 text-xs text-neutral-300 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-brand-warm">{comment.author}</span>
                            <span className="text-[9px] text-neutral-500">{comment.timestamp}</span>
                          </div>
                          <p className="font-sans leading-relaxed text-neutral-400">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write an elegant comment..."
                        value={activeCommentText}
                        onChange={(e) => setActiveCommentText(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-4 py-2 text-xs text-brand-warm focus:outline-none focus:border-brand-gold"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-brand-gold text-brand-matte rounded-xl hover:bg-yellow-500 transition cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Community Sidebar (Regions & Experts) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active groups list */}
          <div className="p-6 rounded-2xl bg-neutral-950/40 border border-neutral-900">
            <h3 className="text-xs uppercase font-mono tracking-wider text-brand-gold flex items-center gap-1.5 mb-4">
              <Users className="w-4 h-4" /> Regional Circles
            </h3>
            <div className="space-y-3 font-sans text-xs text-neutral-400">
              <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 hover:border-brand-gold/30 border border-transparent cursor-pointer">
                <span className="font-medium text-brand-warm">North America Cats</span>
                <span className="text-[10px] text-neutral-500">12k parents</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 hover:border-brand-gold/30 border border-transparent cursor-pointer">
                <span className="font-medium text-brand-warm">Europe Feline Club</span>
                <span className="text-[10px] text-neutral-500">8.5k parents</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-neutral-950 hover:border-brand-gold/30 border border-transparent cursor-pointer">
                <span className="font-medium text-brand-warm">Ragdoll & Maine Coon Alliance</span>
                <span className="text-[10px] text-neutral-500">4.1k breeders</span>
              </div>
            </div>
          </div>

          {/* Expert Tip card */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-gold/10 via-neutral-950 to-neutral-950 border border-brand-gold/15 text-brand-warm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <p className="text-xs uppercase font-mono tracking-wider text-brand-gold font-semibold">Weekly Veterinary Insight</p>
            </div>
            <p className="text-xs font-sans text-neutral-300 leading-relaxed">
              "Feline grooming is more than cosmetics. Brushing helps remove loose undercoat hairs, drastically decreasing the size and frequency of ingested hairballs which can form dangerous bowel obstructions."
            </p>
            <p className="text-[10px] text-brand-gold font-semibold mt-3 font-mono">
              — Dr. Amelia Vance, PurrVerse Scientific Board
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
