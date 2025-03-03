'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black/30 backdrop-blur-sm py-6">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-yellow-500 text-black p-2 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-6 h-6"
                >
                  <path d="M21.721 12.752a9.711 9.711 0 00-.945-5.003 12.754 12.754 0 01-4.339 2.708 18.991 18.991 0 01-.214 4.772 17.165 17.165 0 005.498-2.477zM14.634 15.55a17.324 17.324 0 00.332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 00.332 4.647 17.385 17.385 0 005.268 0zM9.772 17.119a18.963 18.963 0 004.456 0A17.182 17.182 0 0112 21.724a17.18 17.18 0 01-2.228-4.605zM7.777 15.23a18.87 18.87 0 01-.214-4.774 12.753 12.753 0 01-4.34-2.708 9.711 9.711 0 00-.944 5.004 17.165 17.165 0 005.498 2.477zM21.356 14.752a9.765 9.765 0 01-7.478 6.817 18.64 18.64 0 001.988-4.718 18.627 18.627 0 005.49-2.098zM2.644 14.752c1.682.971 3.53 1.688 5.49 2.099a18.64 18.64 0 001.988 4.718 9.765 9.765 0 01-7.478-6.816zM13.878 2.43a9.755 9.755 0 016.116 3.986 11.267 11.267 0 01-3.746 2.504 18.63 18.63 0 00-2.37-6.49zM12 2.276a17.152 17.152 0 012.805 7.121c-.897.23-1.837.353-2.805.353-.968 0-1.908-.122-2.805-.353A17.151 17.151 0 0112 2.276zM10.122 2.43a18.629 18.629 0 00-2.37 6.49 11.266 11.266 0 01-3.746-2.504 9.754 9.754 0 016.116-3.985z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">Deluxe Blackjack</div>
            </div>
            <p className="text-gray-400">
              Experience the thrill of casino blackjack from the comfort of your home. Our game follows standard casino rules with realistic gameplay.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/game" className="text-gray-400 hover:text-white transition-colors">
                  Play Game
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-400 hover:text-white transition-colors">
                  Game Settings
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  Game Rules
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact/Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">About</h3>
            <p className="text-gray-400 mb-4">
              This is a demo blackjack game built with Next.js, React, Tailwind CSS, and Framer Motion. It's for entertainment purposes only.
            </p>
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Deluxe Blackjack. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 