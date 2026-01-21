import { Outlet, Link } from 'react-router-dom';

export default function MyStore() {
  // Parent layout for my-store with child routes (index, template-editor, storefront)
  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Store</h1>
        <div className="flex gap-2">
          <Link to="template-editor" className="px-3 py-1 rounded bg-slate-100 border">Template Editor</Link>
          <Link to="storefront" className="px-3 py-1 rounded bg-slate-100 border">Storefront</Link>
        </div>
      </div>

      <div>
        <Outlet />
      </div>
    </div>
  );
}
