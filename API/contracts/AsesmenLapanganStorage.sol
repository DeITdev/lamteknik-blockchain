// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AsesmenLapanganStorage {
    struct AsesmenLapangan {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => AsesmenLapangan) public asesmenLapanganRecords;
    string[] public asesmenLapanganIds;
    mapping(string => bool) public asesmenLapanganExists;

    event AsesmenLapanganStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event AsesmenLapanganUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeAsesmenLapangan(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !asesmenLapanganExists[_recordId];

        asesmenLapanganRecords[_recordId] = AsesmenLapangan({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            asesmenLapanganIds.push(_recordId);
            asesmenLapanganExists[_recordId] = true;
            emit AsesmenLapanganStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit AsesmenLapanganUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getAsesmenLapangan(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(asesmenLapanganExists[_recordId], "AsesmenLapangan does not exist");

        AsesmenLapangan memory item = asesmenLapanganRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalAsesmenLapangan() public view returns (uint256) {
        return asesmenLapanganIds.length;
    }

    function getAsesmenLapanganIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < asesmenLapanganIds.length, "Index out of bounds");
        return asesmenLapanganIds[_index];
    }

    function getAllAsesmenLapanganIds() public view returns (string[] memory) {
        return asesmenLapanganIds;
    }

    function doesAsesmenLapanganExist(string memory _recordId) public view returns (bool) {
        return asesmenLapanganExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalAsesmenLapangan,
        string[] memory allAsesmenLapanganIds
    ) {
        return (asesmenLapanganIds.length, asesmenLapanganIds);
    }

    function getAsesmenLapanganMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(asesmenLapanganExists[_recordId], "AsesmenLapangan does not exist");

        AsesmenLapangan memory item = asesmenLapanganRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
