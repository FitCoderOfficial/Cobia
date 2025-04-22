import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Cobia
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Track whale wallets, analyze market trends, and make informed investment decisions with our AI-powered platform.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/features" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Reports
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base text-gray-500 hover:text-gray-900 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Cobia. All rights reserved.
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-500 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-gray-500 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-sm text-gray-400 hover:text-gray-500 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 