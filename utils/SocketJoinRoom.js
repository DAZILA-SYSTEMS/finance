const jwt = require("jsonwebtoken");
const constants = require("./const");
const Cred = require("../models/Credential");
const { Op } = require("sequelize");

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function SocketJoinRoom(data, socket) {
  if (data.clientId) {
    socket.join(data.clientId);
    return;
  }
  jwt.verify(data.token, constants.jwtKey, (err, authData) => {
    if (err) {
    } else {
      Cred.findOne({
        where: {
          [Op.or]: [
            {
              email: authData.user.logger,
              instLinker: data.instLinker,
              admin: 1,
              deleted: 0,
            },
            {
              contact: authData.user.logger,
              instLinker: data.instLinker,
              admin: 1,
              deleted: 0,
            },
            {
              email: authData.user.logger,
              instLinker: data.instLinker,
              staff: 1,
              deleted: 0,
            },
            {
              contact: authData.user.logger,
              instLinker: data.instLinker,
              staff: 1,
              deleted: 0,
            },
          ],
        },
      })
        .then(() => {
          socket.join(data.room);
        })
        .catch(() => {});
    }
  });
}

module.exports = SocketJoinRoom;
