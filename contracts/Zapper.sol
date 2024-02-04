// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Pair.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Router02.sol";
import "./integrations/uniswapv2/interfaces/IUniswapV2Factory.sol";
import "./interfaces/IZapper.sol";
import "./token/NFTKeeper.sol";
import "./libs/TransferHelper.sol";
import "./libs/Roles.sol";

import "hardhat/console.sol";

contract Zapper is IZapper, AccessControl {
    using SafeERC20 for IERC20;
    NFTKeeper nftKeeper;
    address nftKeeperToken;

    mapping(address => uint256) public nftToBalance;

    constructor(address _nftKeeperToken) {
        nftKeeperToken = _nftKeeperToken;
        nftKeeper = NFTKeeper(nftKeeperToken);
    }

    function _grabFee() internal {}

    function _lotteryOption() internal {}

    function _mintFTMonkeys(
        address _nftToken,
        uint[] memory tokenIds
    ) public returns (uint nftKeeperTokenValue) {
        if (IERC721(_nftToken).balanceOf(msg.sender) == 0) {
            revert("Zero 721 balance");
        }
        if (tokenIds.length == 0) revert("Should be at least 1 tokenID");
        for (uint i = 0; i < tokenIds.length; i++) {
            IERC721(_nftToken).transferFrom(
                msg.sender,
                address(this),
                tokenIds[i]
            );
        }
        uint tokensForMint = tokenIds.length * 1e18;
        // MINT TOKENS
        nftKeeper.mint(address(this), tokensForMint);
        nftToBalance[_nftToken] += tokensForMint;
        nftKeeperTokenValue = tokensForMint;

        if (IERC20(_nftToken).balanceOf(address(this)) <= 0) {
            revert ZeroTokenBalance(_nftToken);
        }
        emit VirtualMonkeysMinted(_nftToken, tokensForMint);
    }

    function addLiquidityWithNFT(
        address _ftToken,
        address _nftToken,
        address _pair,
        uint _amountFt,
        uint[] memory _amountsNft,
        address _routerAddr,
        address _receiver,
        uint _deadline
    ) public returns (uint liquidity) {
        address token0 = IUniswapV2Pair(_pair).token0();
        address token1 = IUniswapV2Pair(_pair).token1();
        address keeperToken = _ftToken == token0 ? token1 : token0;
        _mintFTMonkeys(_nftToken, _amountsNft);
        uint ftBalance = IERC20(_ftToken).balanceOf(_receiver);
        uint nftKeeperBalance = IERC20(keeperToken).balanceOf(address(this));

        if (ftBalance <= 0) revert ZeroTokenBalance(token0);
        if (nftKeeperBalance <= 0) revert ZeroTokenBalance(token1);

        TransferHelper.safeTransferFrom(
            _ftToken,
            msg.sender,
            address(this),
            _amountFt
        );

        TransferHelper.safeApprove(_ftToken, _routerAddr, _amountFt);
        TransferHelper.safeApprove(keeperToken, _routerAddr, nftKeeperBalance);

        (, , liquidity) = IUniswapV2Router02(_routerAddr).addLiquidity(
            _ftToken,
            keeperToken,
            _amountFt,
            nftKeeperBalance,
            0,
            0,
            _receiver,
            _deadline
        );
    }

    function removeLiquidity(
        address _tokenA,
        address _tokenB,
        address _factory,
        address _router,
        address _receiver
    ) external returns (uint amountA, uint amountB) {
        address pair = IUniswapV2Factory(_factory).getPair(_tokenA, _tokenB);
        uint liquidity = IERC20(pair).balanceOf(_receiver);
        TransferHelper.safeApprove(pair, _router, liquidity);
        TransferHelper.safeTransferFrom(
            pair,
            msg.sender,
            address(this),
            liquidity
        );
        (amountA, amountB) = IUniswapV2Router02(_router).removeLiquidity(
            _tokenA,
            _tokenB,
            liquidity,
            IERC20(_tokenA).balanceOf(_receiver),
            IERC20(_tokenB).balanceOf(_receiver),
            _receiver,
            block.timestamp
        );
    }
}
