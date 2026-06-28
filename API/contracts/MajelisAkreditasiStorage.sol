// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MajelisAkreditasiStorage {
    struct MajelisAkreditasi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => MajelisAkreditasi) public majelisAkreditasiRecords;
    string[] public majelisAkreditasiIds;
    mapping(string => bool) public majelisAkreditasiExists;

    event MajelisAkreditasiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event MajelisAkreditasiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeMajelisAkreditasi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !majelisAkreditasiExists[_recordId];

        majelisAkreditasiRecords[_recordId] = MajelisAkreditasi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            majelisAkreditasiIds.push(_recordId);
            majelisAkreditasiExists[_recordId] = true;
            emit MajelisAkreditasiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit MajelisAkreditasiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getMajelisAkreditasi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(majelisAkreditasiExists[_recordId], "MajelisAkreditasi does not exist");

        MajelisAkreditasi memory item = majelisAkreditasiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalMajelisAkreditasi() public view returns (uint256) {
        return majelisAkreditasiIds.length;
    }

    function getMajelisAkreditasiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < majelisAkreditasiIds.length, "Index out of bounds");
        return majelisAkreditasiIds[_index];
    }

    function getAllMajelisAkreditasiIds() public view returns (string[] memory) {
        return majelisAkreditasiIds;
    }

    function doesMajelisAkreditasiExist(string memory _recordId) public view returns (bool) {
        return majelisAkreditasiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalMajelisAkreditasi,
        string[] memory allMajelisAkreditasiIds
    ) {
        return (majelisAkreditasiIds.length, majelisAkreditasiIds);
    }

    function getMajelisAkreditasiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(majelisAkreditasiExists[_recordId], "MajelisAkreditasi does not exist");

        MajelisAkreditasi memory item = majelisAkreditasiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
