// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "../libs/Roles.sol";

contract NFTKeeper is ERC20, AccessControl {
    constructor() ERC20("NFT Keeper", "NFTK") {}

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function burnFrom(
        address from,
        uint256 amount
    ) external onlyRole(Roles.BURNER_ROLE) {
        _burn(from, amount);
    }
}
