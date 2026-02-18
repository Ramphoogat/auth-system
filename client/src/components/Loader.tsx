import React from "react";

interface LoaderProps {
    size?: number;
    fullScreen?: boolean;
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({
    size = 40,
    fullScreen = false,
    text,
}) => {
    const loader = (
        <div className="flex flex-col items-center justify-center gap-4">
            <div
                style={{ width: size, height: size }}
                className="border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
            />
            {text && (
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                {loader}
            </div>
        );
    }

    return loader;
};

export default Loader;
