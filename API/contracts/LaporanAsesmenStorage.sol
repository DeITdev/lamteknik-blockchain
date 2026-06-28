// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LaporanAsesmenStorage {
    struct LaporanAsesmen {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => LaporanAsesmen) public laporanAsesmenRecords;
    string[] public laporanAsesmenIds;
    mapping(string => bool) public laporanAsesmenExists;

    event LaporanAsesmenStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event LaporanAsesmenUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeLaporanAsesmen(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !laporanAsesmenExists[_recordId];

        laporanAsesmenRecords[_recordId] = LaporanAsesmen({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            laporanAsesmenIds.push(_recordId);
            laporanAsesmenExists[_recordId] = true;
            emit LaporanAsesmenStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit LaporanAsesmenUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getLaporanAsesmen(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(laporanAsesmenExists[_recordId], "LaporanAsesmen does not exist");

        LaporanAsesmen memory item = laporanAsesmenRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalLaporanAsesmen() public view returns (uint256) {
        return laporanAsesmenIds.length;
    }

    function getLaporanAsesmenIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < laporanAsesmenIds.length, "Index out of bounds");
        return laporanAsesmenIds[_index];
    }

    function getAllLaporanAsesmenIds() public view returns (string[] memory) {
        return laporanAsesmenIds;
    }

    function doesLaporanAsesmenExist(string memory _recordId) public view returns (bool) {
        return laporanAsesmenExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalLaporanAsesmen,
        string[] memory allLaporanAsesmenIds
    ) {
        return (laporanAsesmenIds.length, laporanAsesmenIds);
    }

    function getLaporanAsesmenMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(laporanAsesmenExists[_recordId], "LaporanAsesmen does not exist");

        LaporanAsesmen memory item = laporanAsesmenRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
