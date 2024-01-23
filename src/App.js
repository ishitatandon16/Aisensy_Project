// App.js
import React from 'react';
import FileUpload from './components/contactList';
const App = () => {
  const handleFileUpload = (file) => {
    console.log('Uploaded File:', file);
  };

  return (
    <div>
      <h1>Contact Management System</h1>
      <FileUpload onFileUpload={handleFileUpload} />
    </div>
  );
};

export default App;
