// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AttendanceStorage {
    struct Attendance {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Attendance) public attendances;
    string[] public attendanceIds;
    mapping(string => bool) public attendanceExists;

    event AttendanceStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event AttendanceUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeAttendance(string memory _recordId, uint256 _createdTimestamp, uint256 _modifiedTimestamp, string memory _modifiedBy, string memory _allData) public returns (bool) {
        bool isNewAttendance = !attendanceExists[_recordId];
        attendances[_recordId] = Attendance(_recordId, _createdTimestamp, _modifiedTimestamp, _modifiedBy, _allData);
        if (isNewAttendance) {
            attendanceIds.push(_recordId);
            attendanceExists[_recordId] = true;
            emit AttendanceStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit AttendanceUpdated(_recordId, _modifiedTimestamp);
        }
        return true;
    }

    function getAttendance(string memory _recordId) public view returns (string memory, uint256, uint256, string memory, string memory) {
        require(attendanceExists[_recordId], "Attendance does not exist");
        Attendance memory attendance = attendances[_recordId];
        return (attendance.recordId, attendance.createdTimestamp, attendance.modifiedTimestamp, attendance.modifiedBy, attendance.allData);
    }
    function getTotalAttendances() public view returns (uint256) { return attendanceIds.length; }
    function getAttendanceIdByIndex(uint256 _index) public view returns (string memory) { require(_index < attendanceIds.length, "Index out of bounds"); return attendanceIds[_index]; }
    function getAllAttendanceIds() public view returns (string[] memory) { return attendanceIds; }
    function doesAttendanceExist(string memory _recordId) public view returns (bool) { return attendanceExists[_recordId]; }
    function getAttendanceMetadata(string memory _recordId) public view returns (string memory, uint256, uint256, string memory) {
        require(attendanceExists[_recordId], "Attendance does not exist");
        Attendance memory attendance = attendances[_recordId];
        return (attendance.recordId, attendance.createdTimestamp, attendance.modifiedTimestamp, attendance.modifiedBy);
    }
}
