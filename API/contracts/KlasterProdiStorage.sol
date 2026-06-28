// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KlasterProdiStorage {
    struct KlasterProdi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => KlasterProdi) public klasterProdiRecords;
    string[] public klasterProdiIds;
    mapping(string => bool) public klasterProdiExists;

    event KlasterProdiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event KlasterProdiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeKlasterProdi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !klasterProdiExists[_recordId];

        klasterProdiRecords[_recordId] = KlasterProdi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            klasterProdiIds.push(_recordId);
            klasterProdiExists[_recordId] = true;
            emit KlasterProdiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit KlasterProdiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getKlasterProdi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(klasterProdiExists[_recordId], "KlasterProdi does not exist");

        KlasterProdi memory item = klasterProdiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalKlasterProdi() public view returns (uint256) {
        return klasterProdiIds.length;
    }

    function getKlasterProdiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < klasterProdiIds.length, "Index out of bounds");
        return klasterProdiIds[_index];
    }

    function getAllKlasterProdiIds() public view returns (string[] memory) {
        return klasterProdiIds;
    }

    function doesKlasterProdiExist(string memory _recordId) public view returns (bool) {
        return klasterProdiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalKlasterProdi,
        string[] memory allKlasterProdiIds
    ) {
        return (klasterProdiIds.length, klasterProdiIds);
    }

    function getKlasterProdiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(klasterProdiExists[_recordId], "KlasterProdi does not exist");

        KlasterProdi memory item = klasterProdiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
