// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProdiStorage {
    struct Prodi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Prodi) public prodiRecords;
    string[] public prodiIds;
    mapping(string => bool) public prodiExists;

    event ProdiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event ProdiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeProdi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !prodiExists[_recordId];

        prodiRecords[_recordId] = Prodi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            prodiIds.push(_recordId);
            prodiExists[_recordId] = true;
            emit ProdiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit ProdiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getProdi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(prodiExists[_recordId], "Prodi does not exist");

        Prodi memory item = prodiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalProdi() public view returns (uint256) {
        return prodiIds.length;
    }

    function getProdiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < prodiIds.length, "Index out of bounds");
        return prodiIds[_index];
    }

    function getAllProdiIds() public view returns (string[] memory) {
        return prodiIds;
    }

    function doesProdiExist(string memory _recordId) public view returns (bool) {
        return prodiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalProdi,
        string[] memory allProdiIds
    ) {
        return (prodiIds.length, prodiIds);
    }

    function getProdiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(prodiExists[_recordId], "Prodi does not exist");

        Prodi memory item = prodiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
