// Updated color theme for a construction website
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand-primary': {
                    DEFAULT: '#D97706', // amber-600
                    'dark': '#B45309'   // amber-700
                },
                'brand-dark': {
                    DEFAULT: '#1F2937', // gray-800
                    'light': '#374151'  // gray-700
                },
                'brand-light': '#F9FAFB',     // gray-50
                'brand-accent': '#FBBF24',    // amber-400 for highlights
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif']
            }
        }
    }
};