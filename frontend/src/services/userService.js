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
        // Fallback mock data
        resolve({
          name: "Bennet",
          email: "bmatazzoni@g.hmc.edu",
          assignments: [
            { title: "CS225 Assignment 2", due: "2025-04-07T23:59" },
            { title: "MATH241 Quiz", due: "2025-04-09T12:00" }
          ],
          free_time: [
            { start: "2025-04-06T14:00", end: "2025-04-06T15:00" },
            { start: "2025-04-07T16:00", end: "2025-04-07T17:00" },
            { start: "2025-04-08T10:00", end: "2025-04-08T11:00" }
          ]
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