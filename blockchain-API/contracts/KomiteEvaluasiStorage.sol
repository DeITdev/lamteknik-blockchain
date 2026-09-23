// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KomiteEvaluasiStorage {
    struct KomiteEvaluasi {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => KomiteEvaluasi) public komiteEvaluasiRecords;
    string[] public komiteEvaluasiIds;
    mapping(string => bool) public komiteEvaluasiExists;

    event KomiteEvaluasiStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event KomiteEvaluasiUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeKomiteEvaluasi(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !komiteEvaluasiExists[_recordId];

        komiteEvaluasiRecords[_recordId] = KomiteEvaluasi({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            komiteEvaluasiIds.push(_recordId);
            komiteEvaluasiExists[_recordId] = true;
            emit KomiteEvaluasiStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit KomiteEvaluasiUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getKomiteEvaluasi(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(komiteEvaluasiExists[_recordId], "KomiteEvaluasi does not exist");

        KomiteEvaluasi memory item = komiteEvaluasiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalKomiteEvaluasi() public view returns (uint256) {
        return komiteEvaluasiIds.length;
    }

    function getKomiteEvaluasiIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < komiteEvaluasiIds.length, "Index out of bounds");
        return komiteEvaluasiIds[_index];
    }

    function getAllKomiteEvaluasiIds() public view returns (string[] memory) {
        return komiteEvaluasiIds;
    }

    function doesKomiteEvaluasiExist(string memory _recordId) public view returns (bool) {
        return komiteEvaluasiExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalKomiteEvaluasi,
        string[] memory allKomiteEvaluasiIds
    ) {
        return (komiteEvaluasiIds.length, komiteEvaluasiIds);
    }

    function getKomiteEvaluasiMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(komiteEvaluasiExists[_recordId], "KomiteEvaluasi does not exist");

        KomiteEvaluasi memory item = komiteEvaluasiRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
