import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, LogOut, Menu, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { User } from '@supabase/supabase-js';

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  excerpt: string;
  body: string;
  published: boolean;
  ownerId?: string;
  updatedAt?: string;
};

const profilePhoto = '/resources/profile-photo.jpg';
const OWNER_EMAIL = 'anmolgupta7487@gmail.com';
const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/anmol-gupta-9893b827b/', mark: 'linkedin' },
  { label: 'Instagram', href: 'https://www.instagram.com/kindofanmol_/', mark: 'instagram' },
  { label: 'X', href: 'https://x.com/AnmolGupta58978', mark: 'x' },
  { label: 'Email', href: 'mailto:anmolgupta7487@gmail.com', mark: 'email' },
];

const seedPosts: Post[] = [
  { id: 'welcome', title: 'Why I want a corner of the internet', slug: 'welcome', category: 'Note', date: '2026-09-10', excerpt: 'A small website feels different from a feed. I want somewhere ideas can breathe.', body: 'A small website feels different from a feed. I want somewhere ideas can breathe.', published: true },
  { id: 'building', title: 'What I’m learning while building things', slug: 'building', category: 'Learning', date: '2026-09-03', excerpt: 'The most useful lessons rarely arrive as neat tutorials. They arrive after something breaks.', body: 'The most useful lessons rarely arrive as neat tutorials. They arrive after something breaks.', published: true },
  { id: 'attention', title: 'On attention, curiosity, and doing less', slug: 'attention', category: 'Essay', date: '2026-08-21', excerpt: 'A short argument for protecting a little empty space in the day.', body: 'A short argument for protecting a little empty space in the day.', published: true },
];

function words(text: string) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
function readingTime(text: string) { return Math.max(1, Math.ceil(words(text) / 220)); }
function slugify(text: string) { return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80) || `post-${Date.now()}`; }
function formatDate(value: string) { return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(`${value}T12:00:00`)); }
function mapPost(row: any): Post { return { id: row.id, title: row.title, slug: row.slug, category: row.category, date: row.date, excerpt: row.excerpt || '', body: row.body || '', published: !!row.published, ownerId: row.owner_id, updatedAt: row.updated_at }; }

function SocialMark({ type }: { type: string }) {
  if (type === 'linkedin') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 8.2H3V21h3.5V8.2ZM4.75 3A2.05 2.05 0 1 0 4.75 7.1 2.05 2.05 0 0 0 4.75 3ZM21 13.6c0-3.82-2.04-5.6-4.76-5.6-2.19 0-3.17 1.2-3.71 2.04V8.2H9.03V21h3.5v-6.34c0-1.67.32-3.29 2.39-3.29 2.04 0 2.07 1.92 2.07 3.4V21H21v-7.4Z" /></svg>;
  if (type === 'instagram') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.6" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  if (type === 'x') return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.2 3.5h4.05l4.03 5.72 4.77-5.72h2.05l-5.83 6.99 6.53 10.01h-4.05l-4.49-6.87-5.73 6.87H3.48l6.8-8.14L4.2 3.5Zm3.12 1.7 9.35 13.6h1.9L9.22 5.2h-1.9Z" /></svg>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="m5 7 7 5.5L19 7" /></svg>;
}

async function fetchPublishedPosts(search = '', category = ''): Promise<Post[]> {
  let query = supabase.from('posts').select('*').eq('published', true).order('date', { ascending: false });
  if (category) query = query.eq('category', category);
  if (search.trim()) {
    const q = search.trim().replace(/[%_]/g, '');
    query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,body.ilike.%${q}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  const unique = new Map<string, any>();
  for (const row of data || []) if (!unique.has(row.slug)) unique.set(row.slug, row);
  return Array.from(unique.values()).map(mapPost);
}

async function fetchOwnerPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase.from('posts').select('*').eq('owner_id', userId).order('date', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  const unique = new Map<string, any>();
  for (const row of data || []) if (!unique.has(row.slug)) unique.set(row.slug, row);
  return Array.from(unique.values()).map(mapPost);
}

async function ensureSeedPosts(user: User) {
  const { data, error } = await supabase.from('posts').select('slug').in('slug', seedPosts.map(p => p.slug));
  if (error) throw error;
  const existing = new Set((data || []).map((row: any) => row.slug));
  const missing = seedPosts.filter(p => !existing.has(p.slug));
  if (!missing.length) return;
  const now = new Date().toISOString();
  const rows = missing.map(p => ({ id: crypto.randomUUID(), slug: p.slug, title: p.title, category: p.category, date: p.date, excerpt: p.excerpt, body: p.body, published: true, owner_id: user.id, updated_at: now }));
  const { error: insertError } = await supabase.from('posts').insert(rows);
  if (insertError) throw insertError;
}

function App() {
  const [view, setView] = useState<'home' | 'article' | 'studio'>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<Post | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [user, setUser] = useState<User | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadPublic() {
    setLoading(true);
    try { setPosts(await fetchPublishedPosts(query, category === 'All' ? '' : category)); }
    catch { setNotice('Could not load the publication right now.'); }
    finally { setLoading(false); }
  }

  async function loadUser(sessionUser?: User | null) {
    const current = sessionUser ?? (await supabase.auth.getUser()).data.user;
    if (!current) { setUser(null); return; }
    if (current.email?.toLowerCase() !== OWNER_EMAIL) {
      setUser(null);
      await supabase.auth.signOut();
      setNotice('Author access is restricted to Anmol. You can read the notebook, but you cannot edit or publish posts.');
      return;
    }
    setUser(current);
    try { await ensureSeedPosts(current); } catch { setNotice('Signed in, but the starter notes could not be initialized.'); }
  }

  async function loadStudioPosts() { if (!user) return; try { setPosts(await fetchOwnerPosts(user.id)); } catch { setNotice('Could not load your library.'); } }

  useEffect(() => {
    void loadPublic();
    void loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void loadUser(session?.user ?? null); });
    return () => listener.subscription.unsubscribe();
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => { if (view === 'home') void loadPublic(); }, 250); return () => window.clearTimeout(timer); }, [query, category]);
  useEffect(() => { if (view === 'studio' && user) void loadStudioPosts(); }, [view, user]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))], [posts]);
  const openArticle = async (post: Post) => {
    try { const { data, error } = await supabase.from('posts').select('*').eq('id', post.id).single(); if (error) throw error; setSelected(mapPost(data)); }
    catch { setSelected(post); }
    setView('article'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const signIn = async () => {
    setNotice('');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) setNotice('Sign-in could not start. Please try again.');
  };
  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setView('home'); void loadPublic(); };
  const beginNew = () => setEditing({ id: '', title: '', slug: '', category: 'Note', date: new Date().toISOString().slice(0, 10), excerpt: '', body: '', published: false });
  const savePost = async (draft: Post) => {
    if (!user) { setNotice('Please sign in as the author.'); return; }
    if (!draft.title.trim()) { setNotice('A title is required.'); return; }
    if (!draft.body.trim()) { setNotice('Write something before saving.'); return; }
    try {
      const payload = { slug: slugify(draft.slug || draft.title), title: draft.title.trim(), category: draft.category, date: draft.date, excerpt: draft.excerpt.trim() || draft.body.trim().slice(0, 160), body: draft.body, published: draft.published, owner_id: user.id, updated_at: new Date().toISOString() };
      if (draft.id) {
        const { error } = await supabase.from('posts').update(payload).eq('id', draft.id).eq('owner_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert({ id: crypto.randomUUID(), ...payload });
        if (error) throw error;
      }
      setNotice(payload.published ? 'Post published and saved.' : 'Draft saved.'); setEditing(null); await loadStudioPosts();
    } catch (e: any) { setNotice(e?.message?.includes('duplicate') ? 'That slug is already in use. Try a different title.' : 'Save failed. Please try again.'); }
  };
  const deletePost = async (post: Post) => {
    if (!user || !window.confirm(`Delete “${post.title}” permanently?`)) return;
    try { const { error } = await supabase.from('posts').delete().eq('id', post.id).eq('owner_id', user.id); if (error) throw error; setNotice('Post deleted permanently.'); if (selected?.id === post.id) setSelected(null); await loadStudioPosts(); await loadPublic(); }
    catch { setNotice('Delete failed. Your post was not removed.'); }
  };
  const nav = <nav className={`nav ${mobileNav ? 'nav-open' : ''}`}><button onClick={() => { setView('home'); setMobileNav(false); }}>Writing</button><button onClick={() => { if (user?.email?.toLowerCase() === OWNER_EMAIL) setView('studio'); else void signIn(); setMobileNav(false); }}>{user?.email?.toLowerCase() === OWNER_EMAIL ? 'Studio' : 'Author sign in'}</button></nav>;

  if (view === 'article' && selected) {
    const idx = posts.findIndex(p => p.id === selected.id); const previous = idx > 0 ? posts[idx - 1] : null; const next = idx >= 0 && idx < posts.length - 1 ? posts[idx + 1] : null;
    return <div className="site"><header className="topbar"><button className="brand" onClick={() => setView('home')}>ANMOL <span>/ NOTEBOOK</span></button>{nav}<button className="menu" onClick={() => setMobileNav(v => !v)}>{mobileNav ? <X /> : <Menu />}</button></header><main className="reader"><button className="back" onClick={() => setView('home')}><ArrowLeft size={16} /> Back to writing</button><p className="eyebrow">{selected.category} · {formatDate(selected.date)} · {readingTime(selected.body)} MIN READ</p><h1>{selected.title}</h1><p className="reader-excerpt">{selected.excerpt}</p><div className="reader-body">{selected.body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}</div><div className="article-nav">{previous ? <button onClick={() => void openArticle(previous)}><ArrowLeft /> <span>Previous<br /><b>{previous.title}</b></span></button> : <span />}{next ? <button onClick={() => void openArticle(next)}><span>Next<br /><b>{next.title}</b></span> <ArrowRight /></button> : <span />}</div></main></div>;
  }
  if (view === 'studio' && user?.email?.toLowerCase() === OWNER_EMAIL) return <Studio user={user} posts={posts} editing={editing} setEditing={setEditing} beginNew={beginNew} savePost={savePost} deletePost={deletePost} signOut={signOut} notice={notice} setNotice={setNotice} />;
  return <div className="site"><header className="topbar"><button className="brand" onClick={() => setView('home')}>ANMOL <span>/ NOTEBOOK</span></button>{nav}<button className="menu" onClick={() => setMobileNav(v => !v)}>{mobileNav ? <X /> : <Menu />}</button></header><main><section className="hero shell"><div className="hero-copy"><p className="eyebrow">PERSONAL NOTEBOOK · EST. 2026</p><h1>Ideas, experiments,<br /><em>and things worth keeping.</em></h1><p className="intro">A quiet corner of the internet for essays, lessons, experiments, and unfinished thoughts.</p><div className="hero-links"><a href="#posts">Read the notebook</a><a href="#about">About this place</a></div></div><div className="portrait-wrap"><div className="portrait-ring" /><img src={profilePhoto} alt="Anmol's portrait" className="portrait" /><span className="portrait-caption">ANMOL · PERSONAL NOTEBOOK</span><div className="social-links" aria-label="Social links">{socials.map(s => <a className="social-link" key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" aria-label={s.label} title={s.label}><SocialMark type={s.mark} /></a>)}</div></div></section><section className="ticker"><div>NOTES · ESSAYS · BUILDING · LEARNING · LIFE · NOTES · ESSAYS · BUILDING · LEARNING · LIFE · NOTES · ESSAYS · BUILDING · LEARNING · LIFE ·</div></section><section className="posts-section shell" id="posts"><div className="section-head"><div><p className="eyebrow">THE NOTEBOOK</p><h2>Latest writing</h2></div><span className="post-count">{posts.length} {posts.length === 1 ? 'NOTE' : 'NOTES'}</span></div><div className="library-tools"><label className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search the notebook" aria-label="Search the notebook" /></label><div className="category-tabs" aria-label="Filter by category">{categories.map(item => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div></div>{notice && <div className="notice">{notice}<button onClick={() => setNotice('')}><X size={14} /></button></div>}{loading ? <div className="empty-state">Loading the notebook…</div> : posts.length === 0 ? <div className="empty-state">No published notes match that search.</div> : <div className="posts-grid">{posts.map(post => <article className="post-card" key={post.id} onClick={() => void openArticle(post)}><div className="post-meta"><span>{post.category}</span><span>{formatDate(post.date)}</span></div><h3 className="post-title">{post.title}</h3><p className="post-excerpt">{post.excerpt}</p><span className="read-more">Read note <ArrowRight size={15} /></span></article>)}</div>}</section><section className="about shell" id="about"><div><p className="eyebrow">ABOUT</p><h2>A website that feels<br /><em>like a desk.</em></h2></div><div className="about-copy"><p>I'm Anmol. This is my personal corner of the web — deliberately slower and more personal than a social feed.</p><p>I use it to publish things I learn, build, notice, question, and occasionally change my mind about.</p><div className="signature">A.</div></div></section></main><footer className="footer shell"><span>© 2026 ANMOL · NOTEBOOK</span><div className="footer-links">{socials.map(s => <a key={s.label} href={s.href} target={s.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{s.label}</a>)}</div></footer></div>;
}

function Studio({ user, posts, editing, setEditing, beginNew, savePost, deletePost, signOut, notice, setNotice }: any) {
  const [filter, setFilter] = useState('all'); const items = posts.filter((p: Post) => filter === 'all' || (filter === 'published' ? p.published : !p.published));
  if (editing) return <div className="studio editor-only"><Editor post={editing} setPost={setEditing} onSave={savePost} onCancel={() => setEditing(null)} /></div>;
  return <div className="studio"><header className="studio-bar"><div><span className="eyebrow">AUTHOR STUDIO</span><h1>Notebook control room</h1></div><div className="studio-actions"><span className="user-chip">{user.name || user.email}</span><button className="ghost" onClick={signOut}><LogOut size={16} /> Sign out</button></div></header>{notice && <div className="notice">{notice}<button onClick={() => setNotice('')}><X size={14} /></button></div>}<main className="studio-main"><div className="studio-head"><div><p className="eyebrow">YOUR LIBRARY</p><h2>{posts.length} {posts.length === 1 ? 'entry' : 'entries'}</h2></div><div className="studio-actions"><select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All posts</option><option value="published">Published</option><option value="draft">Drafts</option></select><button className="primary" onClick={beginNew}><Plus size={17} /> New post</button></div></div><div className="manage-list">{items.map((post: Post) => <div className="manage-row" key={post.id}><div><div className="row-meta"><span className={post.published ? 'status live' : 'status'}>{post.published ? 'Published' : 'Draft'}</span><span>{post.category}</span><span>{formatDate(post.date)}</span></div><h3>{post.title}</h3><p>{post.excerpt}</p></div><div className="row-actions"><button onClick={() => setEditing(post)} aria-label="Edit"><Pencil size={17} /></button><button className="danger" onClick={() => void deletePost(post)} aria-label="Delete"><Trash2 size={17} /></button></div></div>)}{items.length === 0 && <div className="empty">Nothing here yet.</div>}</div></main></div>;
}

function Editor({ post, setPost, onSave, onCancel }: any) {
  const body = post.body || ''; const categoryOptions = Array.from(new Set(['Note', 'Essay', 'Learning', 'Building', 'Life', post.category].filter(Boolean)));
  return <div className="editor-page"><div className="editor"><h1 className="editor-title">Write something worth keeping.</h1><div className="editor-form"><label className="field-label">Title<input className="title-input" value={post.title} onChange={e => setPost({ ...post, title: e.target.value })} placeholder="The title of your thought" autoFocus /></label><div className="editor-fields"><label className="field-label">Category<select value={post.category} onChange={e => setPost({ ...post, category: e.target.value })}>{categoryOptions.map((option: string) => <option key={option} value={option}>{option}</option>)}</select></label><label className="field-label">Date<input value={post.date} onChange={e => setPost({ ...post, date: e.target.value })} type="date" /></label></div><label className="field-label">Excerpt<textarea className="excerpt-input" value={post.excerpt} onChange={e => setPost({ ...post, excerpt: e.target.value })} placeholder="A short description shown on the homepage" /></label><label className="field-label">Body<textarea className="body-input" value={body} onChange={e => setPost({ ...post, body: e.target.value })} placeholder="Write your post here..." /></label><div className="editor-stats"><span>{words(body).toLocaleString()} words</span><span>{body.length.toLocaleString()} characters</span><span>Aim: 1,000+ words</span></div><div className="editor-footer"><div className="editor-spacer" /><div className="editor-buttons"><button className="editor-secondary" onClick={onCancel}>Manage posts</button><button className="editor-secondary" onClick={() => void onSave({ ...post, published: false })}>Save draft</button><button className="editor-primary" onClick={() => void onSave({ ...post, published: true })}>Publish note</button></div></div></div></div></div>;
}

export default App;
