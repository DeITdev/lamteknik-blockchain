// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PengesahanAlStorage {
    struct PengesahanAl {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => PengesahanAl) public pengesahanAlRecords;
    string[] public pengesahanAlIds;
    mapping(string => bool) public pengesahanAlExists;

    event PengesahanAlStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event PengesahanAlUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storePengesahanAl(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !pengesahanAlExists[_recordId];

        pengesahanAlRecords[_recordId] = PengesahanAl({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            pengesahanAlIds.push(_recordId);
            pengesahanAlExists[_recordId] = true;
            emit PengesahanAlStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit PengesahanAlUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getPengesahanAl(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(pengesahanAlExists[_recordId], "PengesahanAl does not exist");

        PengesahanAl memory item = pengesahanAlRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalPengesahanAl() public view returns (uint256) {
        return pengesahanAlIds.length;
    }

    function getPengesahanAlIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < pengesahanAlIds.length, "Index out of bounds");
        return pengesahanAlIds[_index];
    }

    function getAllPengesahanAlIds() public view returns (string[] memory) {
        return pengesahanAlIds;
    }

    function doesPengesahanAlExist(string memory _recordId) public view returns (bool) {
        return pengesahanAlExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalPengesahanAl,
        string[] memory allPengesahanAlIds
    ) {
        return (pengesahanAlIds.length, pengesahanAlIds);
    }

    function getPengesahanAlMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(pengesahanAlExists[_recordId], "PengesahanAl does not exist");

        PengesahanAl memory item = pengesahanAlRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
