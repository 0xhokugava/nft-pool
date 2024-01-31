// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "./interfaces/IZapper.sol";
import "./token/NFTKeeper.sol";
import "./libs/Roles.sol";

// import "hardhat/console.sol";

contract Zapper is IZapper, AccessControl {
    using SafeERC20 for IERC20;
    NFTKeeper nftKeeper;
    address nftKeeperToken;

    constructor(address _nftKeeperToken) {
        nftKeeperToken = _nftKeeperToken;
        _grantRole(Roles.MINTER_ROLE, address(this));
        _grantRole(Roles.BURNER_ROLE, address(this));
    }

    function _approveFTIfNeeded(address token, address router) public {
        if (IERC20(token).allowance(address(this), router) == 0) {
            IERC20(token).approve(router, type(uint).max);
        }
    }

    function _grabFee() internal {}

    function _lotteryOption() internal {}

    function _mintFTMonkeys(
        address _to,
        address _nftToken,
        uint[] memory tokenIds,
        address _receiver
    ) internal returns (uint nftKeeperTokenValue){
        if (IERC721(_nftToken).balanceOf(_receiver) == 0) {
            revert("Zero 721 balance");
        }
        if (tokenIds.length == 0) revert("Should be at least 1 tokenID");
        IERC721(_nftToken).setApprovalForAll(address(this), true);
        for (uint i = 0; i < tokenIds.length; i++) {
            IERC721(_nftToken).transferFrom(
                _receiver,
                address(this),
                tokenIds[i]
            );
        }
        if (IERC721(_nftToken).balanceOf(msg.sender) < tokenIds.length) {
            revert("Something went wrong");
        }
        // MINT TOKENS
        nftKeeper.mint(_to, tokenIds.length);
        nftKeeperTokenValue = tokenIds.length;
    }

    function addLiquidityWithNFT(
        address _ftToken,
        address _nftToken,
        address _pair,
        uint _amountFt,
        uint[] memory _amountsNft,
        address _routerAddr,
        address _receiver
    ) public returns (uint liquidity) {
        address token0 = IUniswapV2Pair(_pair).token0();
        address token1 = IUniswapV2Pair(_pair).token1();

        address keeperToken = _ftToken == token0 ? token1 : token0;

        _approveFTIfNeeded(token0, _routerAddr);
        _approveFTIfNeeded(token1, _routerAddr);

        uint mintedTokens = _mintFTMonkeys(_receiver, _nftToken, _amountsNft, _receiver);

        if (IERC20(keeperToken).balanceOf(address(this)) <= 0) {
            revert ZeroTokenBalance(keeperToken);
        }

        if (IERC20(_ftToken).balanceOf(address(this)) <= 0) {
            revert ZeroTokenBalance(_ftToken);
        }
        
        (, , liquidity) = IUniswapV2Router01(_routerAddr).addLiquidity(
            _ftToken,
            keeperToken,
            _amountFt,
            mintedTokens,
            0,
            0,
            _receiver,
            block.timestamp
        );
    }
}
