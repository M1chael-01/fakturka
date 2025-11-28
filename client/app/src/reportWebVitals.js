// Function to report web vitals metrics by calling the provided callback
const reportWebVitals = (onPerfEntry) => {
  // Check if the argument is defined and is a function
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the 'web-vitals' library (code splitting)
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Call each metric function and pass the callback to handle the result
      
      // CLS - Cumulative Layout Shift: measures visual stability
      getCLS(onPerfEntry);

      // FID - First Input Delay: measures responsiveness
      getFID(onPerfEntry);

      // FCP - First Contentful Paint: measures loading performance
      getFCP(onPerfEntry);

      // LCP - Largest Contentful Paint: measures loading speed of largest content
      getLCP(onPerfEntry);

      // TTFB - Time to First Byte: measures server responsiveness
      getTTFB(onPerfEntry);
    });
  }
};

// Export the function as the default export of this module
export default reportWebVitals;
