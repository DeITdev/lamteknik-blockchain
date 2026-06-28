// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KlasterProfesiStorage {
    struct KlasterProfesi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => KlasterProfesi) public klasterProfesiRecords;
    string[] public klasterProfesiIds;
    mapping(string => bool) public klasterProfesiExists;

    event KlasterProfesiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event KlasterProfesiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeKlasterProfesi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !klasterProfesiExists[_recordId];

        klasterProfesiRecords[_recordId] = KlasterProfesi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            klasterProfesiIds.push(_recordId);
            klasterProfesiExists[_recordId] = true;
            emit KlasterProfesiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit KlasterProfesiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getKlasterProfesi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(klasterProfesiExists[_recordId], "KlasterProfesi does not exist");

        KlasterProfesi memory item = klasterProfesiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalKlasterProfesi() public view returns (uint256) {
        return klasterProfesiIds.length;
    }

    function getKlasterProfesiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < klasterProfesiIds.length, "Index out of bounds");
        return klasterProfesiIds[_index];
    }

    function getAllKlasterProfesiIds() public view returns (string[] memory) {
        return klasterProfesiIds;
    }

    function doesKlasterProfesiExist(string memory _recordId) public view returns (bool) {
        return klasterProfesiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalKlasterProfesi,
        string[] memory allKlasterProfesiIds
    ) {
        return (klasterProfesiIds.length, klasterProfesiIds);
    }

    function getKlasterProfesiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(klasterProfesiExists[_recordId], "KlasterProfesi does not exist");

        KlasterProfesi memory item = klasterProfesiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
