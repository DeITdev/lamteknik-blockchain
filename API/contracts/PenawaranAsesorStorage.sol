// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PenawaranAsesorStorage {
    struct PenawaranAsesor {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => PenawaranAsesor) public penawaranAsesorRecords;
    string[] public penawaranAsesorIds;
    mapping(string => bool) public penawaranAsesorExists;

    event PenawaranAsesorStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event PenawaranAsesorUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storePenawaranAsesor(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !penawaranAsesorExists[_recordId];

        penawaranAsesorRecords[_recordId] = PenawaranAsesor({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            penawaranAsesorIds.push(_recordId);
            penawaranAsesorExists[_recordId] = true;
            emit PenawaranAsesorStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit PenawaranAsesorUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getPenawaranAsesor(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(penawaranAsesorExists[_recordId], "PenawaranAsesor does not exist");

        PenawaranAsesor memory item = penawaranAsesorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalPenawaranAsesor() public view returns (uint256) {
        return penawaranAsesorIds.length;
    }

    function getPenawaranAsesorIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < penawaranAsesorIds.length, "Index out of bounds");
        return penawaranAsesorIds[_index];
    }

    function getAllPenawaranAsesorIds() public view returns (string[] memory) {
        return penawaranAsesorIds;
    }

    function doesPenawaranAsesorExist(string memory _recordId) public view returns (bool) {
        return penawaranAsesorExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalPenawaranAsesor,
        string[] memory allPenawaranAsesorIds
    ) {
        return (penawaranAsesorIds.length, penawaranAsesorIds);
    }

    function getPenawaranAsesorMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(penawaranAsesorExists[_recordId], "PenawaranAsesor does not exist");

        PenawaranAsesor memory item = penawaranAsesorRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
