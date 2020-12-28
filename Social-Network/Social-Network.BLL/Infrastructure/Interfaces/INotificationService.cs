﻿using System.Collections.Generic;
using Social_Network.BLL.ModelsDto;

namespace Social_Network.BLL.Infrastructure.Interfaces
{
    public interface INotificationService
    {
        void EventAddToFriend(NotificationDto entity);
        ICollection<NotificationDto> GetEventAddToFriend();

        void EventAddToFriendRemove(NotificationDto entity);
    }
}