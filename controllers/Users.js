const users = [];
//ADD uSER
export const addUser = ({ ID, NAME, ROOM }) => {
  NAME = NAME.trim().toLowerCase();
  ROOM = ROOM.trim().toLowerCase();
  const currUser = users.find(
    (users) => users.ROOM === ROOM && users.NAME === Name
  );

  //validation
  if (currUser) {
    return { error: "User is Already here!" };
  }

  const user = { ID, NAME, ROOM };
  users.push(user);
  return { user };
};

// REMOVE USER
export const removeUser = (ID) => {
  const index = users.findIndex((user) => user.ID === ID);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

//GET USER
export const getUser = (ID) => users.find((user) => user.ID === ID);

//GET USERS IN ROOM
export const getUsersInRoom = (room) =>
  users.filter((user) => user.ROOM === ROOM);

//test validation
export const Valid = (req, res) => {
  res.send("Server is running now !!");
};
