// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @notice Append-only ERPNext Attendance payload hashes. Full HR payloads never enter contract storage.
contract AttendanceStorage {
    struct Version { uint256 version; uint256 createdTimestamp; uint256 modifiedTimestamp; string modifiedBy; bytes32 payloadHash; string sourceEventId; bool deleted; }
    mapping(string => Version[]) private versions;
    mapping(string => bool) public attendanceExists;
    mapping(bytes32 => bool) private processedEvents;
    string[] private attendanceIds;
    event AttendanceVersionStored(string indexed recordId, uint256 indexed version, bytes32 payloadHash, string sourceEventId, bool deleted);

    function storeAttendance(string memory recordId, uint256 createdTimestamp, uint256 modifiedTimestamp, string memory modifiedBy, bytes32 payloadHash, string memory sourceEventId, bool deleted) public returns (uint256) {
        require(bytes(recordId).length > 0, "Missing record ID"); require(bytes(sourceEventId).length > 0, "Missing source event ID");
        bytes32 eventKey = keccak256(abi.encode(recordId, sourceEventId)); require(!processedEvents[eventKey], "Source event already stored"); processedEvents[eventKey] = true;
        if (!attendanceExists[recordId]) { attendanceExists[recordId] = true; attendanceIds.push(recordId); }
        uint256 version = versions[recordId].length + 1;
        versions[recordId].push(Version(version, createdTimestamp, modifiedTimestamp, modifiedBy, payloadHash, sourceEventId, deleted));
        emit AttendanceVersionStored(recordId, version, payloadHash, sourceEventId, deleted); return version;
    }
    function getAttendance(string memory recordId) public view returns (Version memory) { require(attendanceExists[recordId], "Attendance does not exist"); return versions[recordId][versions[recordId].length - 1]; }
    function getAttendanceVersion(string memory recordId, uint256 version) public view returns (Version memory) { require(version > 0 && version <= versions[recordId].length, "Version does not exist"); return versions[recordId][version - 1]; }
    function getAttendanceVersionCount(string memory recordId) public view returns (uint256) { return versions[recordId].length; }
    function getTotalAttendances() public view returns (uint256) { return attendanceIds.length; }
    function getAllAttendanceIds() public view returns (string[] memory) { return attendanceIds; }
    function doesAttendanceEventExist(string memory recordId, string memory sourceEventId) public view returns (bool) { return processedEvents[keccak256(abi.encode(recordId, sourceEventId))]; }
    function verifyAttendanceVersion(string memory recordId, uint256 version, bytes32 payloadHash) public view returns (bool) { return getAttendanceVersion(recordId, version).payloadHash == payloadHash; }
}
