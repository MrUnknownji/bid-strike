export default function NotFoundPage() {
    return (
        <div className="min-h-[500px] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-200">404</h1>
                <p className="text-xl text-gray-600 mt-4">Page not found</p>
                <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    Go back home
                </a>
            </div>
        </div>
    );
}
