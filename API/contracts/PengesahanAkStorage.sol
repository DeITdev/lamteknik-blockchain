// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PengesahanAkStorage {
    struct PengesahanAk {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => PengesahanAk) public pengesahanAkRecords;
    string[] public pengesahanAkIds;
    mapping(string => bool) public pengesahanAkExists;

    event PengesahanAkStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event PengesahanAkUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storePengesahanAk(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !pengesahanAkExists[_recordId];

        pengesahanAkRecords[_recordId] = PengesahanAk({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            pengesahanAkIds.push(_recordId);
            pengesahanAkExists[_recordId] = true;
            emit PengesahanAkStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit PengesahanAkUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getPengesahanAk(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(pengesahanAkExists[_recordId], "PengesahanAk does not exist");

        PengesahanAk memory item = pengesahanAkRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalPengesahanAk() public view returns (uint256) {
        return pengesahanAkIds.length;
    }

    function getPengesahanAkIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < pengesahanAkIds.length, "Index out of bounds");
        return pengesahanAkIds[_index];
    }

    function getAllPengesahanAkIds() public view returns (string[] memory) {
        return pengesahanAkIds;
    }

    function doesPengesahanAkExist(string memory _recordId) public view returns (bool) {
        return pengesahanAkExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalPengesahanAk,
        string[] memory allPengesahanAkIds
    ) {
        return (pengesahanAkIds.length, pengesahanAkIds);
    }

    function getPengesahanAkMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(pengesahanAkExists[_recordId], "PengesahanAk does not exist");

        PengesahanAk memory item = pengesahanAkRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
