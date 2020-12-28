﻿using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Social_Network.BLL.Infrastructure.Interfaces;

namespace Social_Network.API.Infrastructure.Manages.HubConnect
{
    public class HubConnect : Hub
    {
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly IFriendService _friendService;

        public HubConnect(IConfiguration configuration, 
                          IMapper mapper, 
                          INotificationService notificationService, 
                          IFriendService friendService)
        {
            this._notificationService = notificationService;
            this._configuration = configuration;
            this._mapper = mapper;
            this._friendService = friendService;
        }

        public override async Task OnConnectedAsync()
        {
            await this.GetEventAddToFriends();
            await this.GetUsersInFriendship();
            await base.OnConnectedAsync();
        }

        private async Task GetEventAddToFriends()
        {
            var getEventAddToFriends = this._notificationService.GetEventAddToFriend();
            var nameResponse = this._configuration["HubInfo:GetEventAddToFriends"];
            await this.Clients.All.SendAsync(nameResponse, getEventAddToFriends);
        }

        private async Task GetUsersInFriendship()
        {
            var getUsersInFriendship = this._friendService.UsersInFriendship();
            var nameResponse = this._configuration["HubInfo:GetUsersInFriendship"];
            await this.Clients.All.SendAsync(nameResponse, getUsersInFriendship);
        }
    }
}