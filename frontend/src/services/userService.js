// UserService - handles user data operations
const userService = {
  // Get all users
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/db/users.json');
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
        const response = await fetch('/db/users.json');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        
        const allAssignments = new Map();
        data.users.forEach(user => {
          user.assignments.forEach(assignment => {
            allAssignments.set(assignment.title, assignment);
          });
        });
        resolve(Array.from(allAssignments.values()));
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
        const response = await fetch('/db/users.json');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        const user = data.users.find(user => user.email === email) || null;
        
        if (user) {
          resolve(user);
        } else {
          // Generate a new user with that email
          const name = email.split('@')[0]; // Basic name from email
          
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
            
            // Morning slot
            const morningStart = new Date(slotDate);
            morningStart.setHours(9, 0, 0);
            const morningEnd = new Date(slotDate);
            morningEnd.setHours(11, 0, 0);
            
            // Afternoon slot
            const afternoonStart = new Date(slotDate);
            afternoonStart.setHours(14, 0, 0);
            const afternoonEnd = new Date(slotDate);
            afternoonEnd.setHours(16, 0, 0);
            
            freeTimeSlots.push({
              start: morningStart.toISOString(),
              end: morningEnd.toISOString()
            });
            
            freeTimeSlots.push({
              start: afternoonStart.toISOString(),
              end: afternoonEnd.toISOString()
            });
          }
          
          const newUser = {
            name: name,
            email: email,
            assignments: [
              { title: "CS101 Introduction", due: new Date(currentYear, currentMonth, currentDate + 3).toISOString() }
            ],
            free_time: freeTimeSlots
          };
          
          resolve(newUser);
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
        const response = await fetch('/db/users.json');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        
        // Extract course codes from assignments to create study groups
        const courses = new Set();
        data.users.forEach(user => {
          user.assignments.forEach(assignment => {
            const courseMatch = assignment.title.match(/^([A-Z]+\d+)/);
            if (courseMatch) {
              courses.add(courseMatch[0]);
            }
          });
        });
        
        const studyGroups = Array.from(courses).map(course => ({
          id: Math.random().toString(36).substr(2, 9),
          name: `${course} Study Group`,
          members: data.users
            .filter(user => 
              user.assignments.some(assignment => 
                assignment.title.startsWith(course)
              )
            )
            .map(user => user.name)
        }));
        
        resolve(studyGroups);
      } catch (error) {
        console.error('Error fetching study groups:', error);
        // Fallback mock data
        resolve([
          { id: "g1", name: "CS225 Study Group", members: ["Alice", "Bob", "Dana"] },
          { id: "g2", name: "MATH241 Study Group", members: ["Alice", "Charlie", "Dana"] },
          { id: "g3", name: "PHYS211 Study Group", members: ["Bob", "Charlie", "Eli"] }
        ]);
      }
    });
  }
};

export default userService; 