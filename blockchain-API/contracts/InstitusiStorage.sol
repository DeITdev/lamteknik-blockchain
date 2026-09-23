// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InstitusiStorage {
    struct Institusi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Institusi) public institusiRecords;
    string[] public institusiIds;
    mapping(string => bool) public institusiExists;

    event InstitusiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event InstitusiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeInstitusi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !institusiExists[_recordId];

        institusiRecords[_recordId] = Institusi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            institusiIds.push(_recordId);
            institusiExists[_recordId] = true;
            emit InstitusiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit InstitusiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getInstitusi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(institusiExists[_recordId], "Institusi does not exist");

        Institusi memory item = institusiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalInstitusi() public view returns (uint256) {
        return institusiIds.length;
    }

    function getInstitusiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < institusiIds.length, "Index out of bounds");
        return institusiIds[_index];
    }

    function getAllInstitusiIds() public view returns (string[] memory) {
        return institusiIds;
    }

    function doesInstitusiExist(string memory _recordId) public view returns (bool) {
        return institusiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalInstitusi,
        string[] memory allInstitusiIds
    ) {
        return (institusiIds.length, institusiIds);
    }

    function getInstitusiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(institusiExists[_recordId], "Institusi does not exist");

        Institusi memory item = institusiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
