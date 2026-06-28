// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserStorage {
    struct User {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => User) public userRecords;
    string[] public userIds;
    mapping(string => bool) public userExists;

    event UserStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event UserUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeUser(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !userExists[_recordId];

        userRecords[_recordId] = User({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            userIds.push(_recordId);
            userExists[_recordId] = true;
            emit UserStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit UserUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getUser(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(userExists[_recordId], "User does not exist");

        User memory item = userRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalUser() public view returns (uint256) {
        return userIds.length;
    }

    function getUserIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < userIds.length, "Index out of bounds");
        return userIds[_index];
    }

    function getAllUserIds() public view returns (string[] memory) {
        return userIds;
    }

    function doesUserExist(string memory _recordId) public view returns (bool) {
        return userExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalUser,
        string[] memory allUserIds
    ) {
        return (userIds.length, userIds);
    }

    function getUserMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(userExists[_recordId], "User does not exist");

        User memory item = userRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
