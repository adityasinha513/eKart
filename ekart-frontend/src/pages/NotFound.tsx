import { Link } from "react-router-dom";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(180,105,34,0.14),_transparent_32%)] px-4 py-12">
      <div className="max-w-lg rounded-[32px] border border-mithai-200 bg-white p-8 text-center shadow-[0_25px_80px_rgba(120,66,31,0.14)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-maroon-700">404 error</p>
        <h1 className="mt-3 text-4xl font-semibold text-maroon-900">Page not found</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">The route you requested doesn’t exist, but your next box of sweets is still waiting.</p>
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <PrimaryButton>Back to home</PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
