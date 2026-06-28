// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AsesorStorage {
    struct Asesor {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Asesor) public asesorRecords;
    string[] public asesorIds;
    mapping(string => bool) public asesorExists;

    event AsesorStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event AsesorUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeAsesor(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !asesorExists[_recordId];

        asesorRecords[_recordId] = Asesor({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            asesorIds.push(_recordId);
            asesorExists[_recordId] = true;
            emit AsesorStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit AsesorUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getAsesor(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(asesorExists[_recordId], "Asesor does not exist");

        Asesor memory item = asesorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalAsesor() public view returns (uint256) {
        return asesorIds.length;
    }

    function getAsesorIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < asesorIds.length, "Index out of bounds");
        return asesorIds[_index];
    }

    function getAllAsesorIds() public view returns (string[] memory) {
        return asesorIds;
    }

    function doesAsesorExist(string memory _recordId) public view returns (bool) {
        return asesorExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalAsesor,
        string[] memory allAsesorIds
    ) {
        return (asesorIds.length, asesorIds);
    }

    function getAsesorMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(asesorExists[_recordId], "Asesor does not exist");

        Asesor memory item = asesorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
