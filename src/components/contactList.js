import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import readXlsxFile from "read-excel-file";
import "./contactList.css"; // Import your CSS file

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Adjust this value based on your preference

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    setSelectedFile(file);

    try {
      let content;
      if (file.name.endsWith(".csv")) {
        // Read CSV file
        content = await file.text();
        // Parse CSV content (you might need to adjust this parsing logic based on your CSV format)
        const rows = content.split("\n").map((row) => row.split(","));
        const headers = rows[0];
        const contactsData = rows.slice(1).map((row) => {
          const contact = {};
          headers.forEach((header, index) => {
            contact[header] = row[index];
          });
          return contact;
        });
        setContacts(contactsData);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // Read Excel file
        content = await readXlsxFile(file);
        // Assuming the first row of the Excel file contains headers
        const headers = content[0];
        const contactsData = content.slice(1).map((row) => {
          const contact = {};
          headers.forEach((header, index) => {
            contact[header] = row[index];
          });
          return contact;
        });
        setContacts(contactsData);
      } else {
        console.error("Unsupported file format");
        return;
      }
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const sendContactsToBackend = async () => {
    try {
      const apiUrl = "http://localhost:8000/contact";

      // Send each contact to the backend API
      for (const contact of contacts) {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contact),
        });

        // Handle the response as needed
        const result = await response.json();
        console.log("Contact added:", result);
      }
    } catch (error) {
      console.error("Error sending contact data to the backend:", error);
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastContact = currentPage * itemsPerPage;
  const indexOfFirstContact = indexOfLastContact - itemsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);

  const { getRootProps, getInputProps } = useDropzone({
    accept: [".csv", ".xlsx", ".xls"],
    onDrop,
  });

  return (
    <div>
      <div {...getRootProps()} className="dropzone">
        <input  {...getInputProps()} />
        <p>Drop a CSV or Excel file here, or click to select one</p>
      </div>
      {selectedFile && (
        <div>
          <p>Selected File: {selectedFile.name}</p>
          {contacts.length > 0 && (
            <div>
              <p>Contact Management:</p>
              <table className="contact-table table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Select</th>
                    <th scope="col">Name</th>
                    <th scope="col">Mobile no.</th>
                    <th scope="col">email</th>
                    <th scope="col">Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {currentContacts.map((contact, index) => (
                    <tr key={index}>
                      <td>{contact.S_no}</td>
                      <td>
                        <input type="checkbox" id={`contact-${index}`} />
                      </td>
                      <td>{contact.Name}</td>
                      <td>{contact.Phone_No}</td>
                      <td>{contact.Email}</td>
                      <td>{contact.Tags}</td>
                      {/* Add other relevant fields */}
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="pagination">
                {Array.from({ length: Math.ceil(contacts.length / itemsPerPage) }).map((_, index) => (
                  <li key={index} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                    <button onClick={() => paginate(index + 1)} className="page-link">
                      {index + 1}
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={sendContactsToBackend}>Upload Contacts</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
