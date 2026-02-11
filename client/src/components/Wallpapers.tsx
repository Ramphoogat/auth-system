import React from 'react';
import { useWindows } from '../context/WindowContext';

const Wallpapers: React.FC = () => {
  const { setWallpaper } = useWindows();

  const wallpaperList = [
    { name: 'Default MacOS', file: 'MacOS.jpg' },
    { name: 'MacOS Blue', file: 'macOS1.jpg' },
    { name: 'MacOS Dark', file: 'macOS2.jpg' },
    { name: 'Colorful Liquid', file: 'Colorful.jpg' },
    { name: 'Silent Haven', file: 'Silent Mystic Haven.jpg' },
    { name: 'MacBook Pro', file: 'MacBook Pro 14 wallpaper.jpg' },
    { name: 'Beach House', file: 'beachhouse.jpg' },
    { name: 'Cat', file: 'cat.jpg' },
    { name: 'Mindset', file: 'mindset.jpg' },
    { name: 'Marble', file: 'marbel.jpg' },
    { name: 'Nature', file: 'download.jpg' }
  ];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Desktop Wallpaper</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {wallpaperList.map((wp) => (
          <div 
            key={wp.file}
            className="group cursor-pointer"
            onClick={() => setWallpaper(wp.file)}
          >
            <div className="aspect-video rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all shadow-md relative">
              <img 
                src={`/src/assets/${wp.file}`} 
                alt={wp.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <p className="mt-2 text-xs text-center text-gray-600 font-medium">{wp.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wallpapers;
