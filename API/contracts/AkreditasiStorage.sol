// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AkreditasiStorage {
    struct Akreditasi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Akreditasi) public akreditasiRecords;
    string[] public akreditasiIds;
    mapping(string => bool) public akreditasiExists;

    event AkreditasiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event AkreditasiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeAkreditasi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !akreditasiExists[_recordId];

        akreditasiRecords[_recordId] = Akreditasi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            akreditasiIds.push(_recordId);
            akreditasiExists[_recordId] = true;
            emit AkreditasiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit AkreditasiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getAkreditasi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(akreditasiExists[_recordId], "Akreditasi does not exist");

        Akreditasi memory item = akreditasiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalAkreditasi() public view returns (uint256) {
        return akreditasiIds.length;
    }

    function getAkreditasiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < akreditasiIds.length, "Index out of bounds");
        return akreditasiIds[_index];
    }

    function getAllAkreditasiIds() public view returns (string[] memory) {
        return akreditasiIds;
    }

    function doesAkreditasiExist(string memory _recordId) public view returns (bool) {
        return akreditasiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalAkreditasi,
        string[] memory allAkreditasiIds
    ) {
        return (akreditasiIds.length, akreditasiIds);
    }

    function getAkreditasiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(akreditasiExists[_recordId], "Akreditasi does not exist");

        Akreditasi memory item = akreditasiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
