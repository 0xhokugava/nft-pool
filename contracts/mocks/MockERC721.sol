// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    constructor() ERC721("Monkey item", "MIT") {

    }

    function mint(address _to, uint _tokenId) public {
        _mint(_to, _tokenId);
    }
}
