// Mobile Menu Debug Script
console.log('🔧 Mobile Menu Debug Script Loaded');

// Check if Vue is loaded
if (typeof Vue !== 'undefined') {
    console.log('✅ Vue is loaded');
} else {
    console.log('❌ Vue not found');
}

// Check if Pinia is loaded
if (typeof Pinia !== 'undefined') {
    console.log('✅ Pinia is loaded');
} else {
    console.log('❌ Pinia not found');
}

// Check window size
console.log('📱 Window size:', window.innerWidth, 'x', window.innerHeight);
console.log('📱 Is mobile:', window.innerWidth <= 992);

// Check for mobile menu button
const menuBtn = document.querySelector('.mobile-menu-btn');
if (menuBtn) {
    console.log('✅ Mobile menu button found');
    console.log('📍 Button position:', menuBtn.getBoundingClientRect());
    console.log('🎨 Button styles:', window.getComputedStyle(menuBtn));
} else {
    console.log('❌ Mobile menu button not found');
}

// Check for sidebar
const sidebar = document.querySelector('.ant-layout-sider');
if (sidebar) {
    console.log('✅ Sidebar found');
    console.log('📍 Sidebar position:', sidebar.getBoundingClientRect());
    console.log('🎨 Sidebar styles:', window.getComputedStyle(sidebar));
} else {
    console.log('❌ Sidebar not found');
}

// Check for header
const header = document.querySelector('.layout-header-fixed');
if (header) {
    console.log('✅ Header found');
    console.log('📍 Header position:', header.getBoundingClientRect());
} else {
    console.log('❌ Header not found');
}

// Add click listener to test
document.addEventListener('click', (e) => {
    if (e.target.closest('.mobile-menu-btn')) {
        console.log('🔥 Mobile menu button clicked!');
    }
});

// Monitor resize events
window.addEventListener('resize', () => {
    console.log('📱 Window resized:', window.innerWidth, 'x', window.innerHeight);
});

console.log('🎯 Debug script ready');
