export const fetchEmployees = async (token) => {
    const response = await fetch("http://192.168.1.226:8000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch employees");
    }
  
    return response.json();
  };
  
  export const deleteEmployee = async (id, token) => {
    const response = await fetch(`http://192.168.1.226:8000/api/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to delete employee");
    }
  
    return response.json();
  };
  