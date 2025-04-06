// UserService - handles user data operations
const BACKEND_URL = 'http://127.0.0.1:5000';

const userService = {
  // Get all users
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/users`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        resolve(data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback mock data
        resolve([
          { name: "Alice", email: "alice@example.com" },
          { name: "Bob", email: "bob@example.com" },
          { name: "Charlie", email: "charlie@example.com" },
          { name: "Dana", email: "dana@example.com" },
          { name: "Eli", email: "eli@example.com" },
          { name: "Farah", email: "farah@example.com" }
        ]);
      }
    });
  },

  // Get a specific user by ID or index
  getUserById: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/db/users.json');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        const user = data.users[id] || data.users[0];
        resolve(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        // Get current date to create dynamic time slots
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();
        
        // Create time slots for the next 5 days
        const freeTimeSlots = [];
        
        // Generate 2-3 time slots per day for the next 5 days
        for (let day = 0; day < 5; day++) {
          const slotDate = new Date(currentYear, currentMonth, currentDate + day);
          
          // Morning slot (9-11 AM)
          const morningStart = new Date(slotDate);
          morningStart.setHours(9, 0, 0);
          const morningEnd = new Date(slotDate);
          morningEnd.setHours(11, 0, 0);
          
          // Afternoon slot (2-4 PM)
          const afternoonStart = new Date(slotDate);
          afternoonStart.setHours(14, 0, 0);
          const afternoonEnd = new Date(slotDate);
          afternoonEnd.setHours(16, 0, 0);
          
          // Evening slot (7-9 PM) - only add for some days
          if (day % 2 === 0) {
            const eveningStart = new Date(slotDate);
            eveningStart.setHours(19, 0, 0);
            const eveningEnd = new Date(slotDate);
            eveningEnd.setHours(21, 0, 0);
            
            freeTimeSlots.push({
              start: eveningStart.toISOString(),
              end: eveningEnd.toISOString()
            });
          }
          
          // Add morning and afternoon slots
          freeTimeSlots.push({
            start: morningStart.toISOString(),
            end: morningEnd.toISOString()
          });
          
          freeTimeSlots.push({
            start: afternoonStart.toISOString(),
            end: afternoonEnd.toISOString()
          });
        }
        
        // Fallback mock data
        resolve({
          name: "Alice",
          email: "alice@example.com",
          assignments: [
            { title: "CS225 Assignment 2", due: "2025-04-07T23:59" },
            { title: "MATH241 Quiz", due: "2025-04-09T12:00" }
          ],
          free_time: freeTimeSlots
        });
      }
    });
  },

  // Get all assignments from all users (unique)
  getAllAssignments: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/assignments/all`);
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }
        const data = await response.json();
        resolve(data.assignments);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        // Fallback mock data
        resolve([
          { title: "CS225 Assignment 2", due: "2025-04-07T23:59" },
          { title: "MATH241 Quiz", due: "2025-04-09T12:00" },
          { title: "PHYS211 Lab", due: "2025-04-10T15:00" },
          { title: "STAT400 Homework", due: "2025-04-11T23:59" }
        ]);
      }
    });
  },

  // Get user by email
  getUserByEmail: (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/user/${email}`);
        
        if (response.ok) {
          const userData = await response.json();
          resolve(userData);
        } else {
          // If user not found, try to create a basic one
          console.log("User not found, creating basic user profile");
          const createResponse = await fetch(`${BACKEND_URL}/api/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: email.split('@')[0],
              email: email
            }),
          });
          
          if (createResponse.ok) {
            // Now try to get the user again
            const newUserResponse = await fetch(`${BACKEND_URL}/api/user/${email}`);
            if (newUserResponse.ok) {
              const newUserData = await newUserResponse.json();
              resolve(newUserData);
              return;
            }
          }
          
          throw new Error('Failed to fetch or create user');
        }
      } catch (error) {
        console.error('Error fetching user by email:', error);
        // Generate a fallback user with the provided email
        const name = email.split('@')[0];
        
        // Get current date to create dynamic time slots
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();
        
        // Create time slots for the next 5 days
        const freeTimeSlots = [];
        
        // Generate time slots
        for (let day = 0; day < 5; day++) {
          const slotDate = new Date(currentYear, currentMonth, currentDate + day);
          
          // Morning slot
          const morningStart = new Date(slotDate);
          morningStart.setHours(9, 0, 0);
          const morningEnd = new Date(slotDate);
          morningEnd.setHours(11, 0, 0);
          
          freeTimeSlots.push({
            start: morningStart.toISOString(),
            end: morningEnd.toISOString()
          });
        }
        
        resolve({
          name: name,
          email: email,
          assignments: [
            { title: "CS101 Introduction", due: new Date(currentYear, currentMonth, currentDate + 3).toISOString() }
          ],
          free_time: freeTimeSlots
        });
      }
    });
  },

  // Get study groups based on assignments
  getStudyGroups: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/study-groups`);
        if (!response.ok) {
          throw new Error('Failed to fetch study groups');
        }
        const data = await response.json();
        resolve(data.groups);
      } catch (error) {
        console.error('Error fetching study groups:', error);
        // Fallback mock data
        resolve([
          {
            id: 1,
            name: "CS225 Study Group",
            assignment: "CS225 Assignment 2",
            due: "2025-04-07T23:59",
            members: ["alice@example.com", "bob@example.com", "charlie@example.com"],
            member_names: ["Alice", "Bob", "Charlie"],
            member_count: 3
          },
          {
            id: 2,
            name: "MATH241 Study Group",
            assignment: "MATH241 Quiz",
            due: "2025-04-09T12:00",
            members: ["bob@example.com", "dana@example.com"],
            member_names: ["Bob", "Dana"],
            member_count: 2
          }
        ]);
      }
    });
  },
  
  // Get classmates for a specific user (users with same assignments)
  getClassmates: (email) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/classmates/${email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch classmates');
        }
        const data = await response.json();
        resolve(data.classmates);
      } catch (error) {
        console.error('Error fetching classmates:', error);
        // Fallback mock data
        resolve({
          "CS225 Assignment 2": [
            { name: "Bob", email: "bob@example.com" },
            { name: "Charlie", email: "charlie@example.com" }
          ],
          "MATH241 Quiz": [
            { name: "Dana", email: "dana@example.com" }
          ]
        });
      }
    });
  }
};

export default userService; 