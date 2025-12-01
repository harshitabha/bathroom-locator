import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {useEffect, useState, useContext} from 'react';
import './Like.css';
import {Typography} from '@mui/material';
import type {Bathroom} from '../../types';
import React from 'react';
import BathroomContext from '../../context/BathroomContext';
import { API_BASE_URL } from '../../utils/api';

interface LikeProps {
  userId: string | null;
}
/**
 * gets users liked bathrooms
 * @param {string} userId user id
 * @returns {Array} array of liked bathroom ids
 */
async function getLikedBathrooms(userId: string | null) {
  let bathrooms : Array<string> = [];

  const res = await fetch(`${API_BASE_URL}/user/likes?userId=${userId}`);
  if (res.ok) {
    bathrooms = await res.json();
  } else {
    console.error('Error fetching liked bathrooms: ', res.statusText);
  }

  return bathrooms;
}

/**
 * removes the user's like from the bathroom
 * @param {string} userId user id
 * @param {Bathroom | null} bathroom selected bathroom
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLiked liked setter
 */
async function unlikeBathroom(
    userId: string | null,
    bathroom: Bathroom | null,
    setLiked: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const bathroomId = bathroom!.id;
  const res = await fetch(`${API_BASE_URL}/user/likes`, {
    method: 'delete',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userId,
      bathroomId,
    }),
  });

  if (res.ok) {
    setLiked(false);
  } else {
    console.error('Error deleting like: ', res.statusText);
  }

  return;
}

/**
 * adds like to the bathroom
 * @param {string} userId user id
 * @param {Bathroom | null} bathroom selected bathroom
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLiked liked setter
 */
async function likeBathroom(
    userId: string | null,
    bathroom: Bathroom | null,
    setLiked: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const bathroomId = bathroom?.id;
  const res = await fetch(`${API_BASE_URL}/user/likes`, {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userId,
      bathroomId,
    }),
  });

  if (res.ok) {
    setLiked(true);
  } else {
    console.error('Error adding like: ', res.statusText);
  }

  return;
}

const Like = ({userId}: LikeProps) => {
  const [liked, setLiked] = useState(false);
  const bathroomContext = useContext(BathroomContext);
  const bathroom = bathroomContext.selected;
  useEffect(() => {
    /**
     * checks if user has liked the current bathroom
     */
    async function isLiked() {
      const likedBathrooms = await getLikedBathrooms(userId);
      setLiked(likedBathrooms.includes(bathroom!.id));
    }

    if (userId) {
      isLiked();
    };
  }, [userId, bathroom!.id]);

  const handleToggle = async () => {
    // update likes table
    if (liked) {
      await unlikeBathroom(
          userId,
          bathroom,
          setLiked,
      );
    } else {
      await likeBathroom(
          userId,
          bathroom,
          setLiked,
      );
    }
  };

  return (
    userId ?
    <div className='like-button'
      aria-label='like-button' onClick = {handleToggle}>
      {liked ?
        <FavoriteIcon color="error" aria-label={`Unlike ${bathroom!.name}`}/> :
        <FavoriteBorderIcon aria-label={`Like ${bathroom!.name}`}/>}
      <Typography color="textSecondary" className="like-number">
        {bathroom!.likes > 0 ? bathroom!.likes : null}
      </Typography>
    </div> :
    null
  );
};

export default Like;
