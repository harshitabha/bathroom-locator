import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import {useEffect, useState} from 'react';
import './Like.css';
import {Typography} from '@mui/material';
import type {Bathroom} from '../../types';
import React from 'react';

interface LikeProps {
  bathroom: Bathroom;
  userId: string | null;
  likes: number;
  setLikes: React.Dispatch<React.SetStateAction<number>>;
}
/**
 * gets users liked bathrooms
 * @param {string} userId user id
 * @returns {Array} array of liked bathroom ids
 */
async function getLikedBathrooms(userId: string | null) {
  let bathrooms : Array<string> = [];

  const res = await fetch(`http://localhost:3000/user/likes?userId=${userId}`);
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
 * @param {string} bathroomId bathroom id
 * @param {number} bathroomLikes saved bathroom likes
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLiked liked setter
 * @param {React.Dispatch<React.SetStateAction<number>>} setLikes likes setter
 * @param {number} likes number of likes
 */
async function unlikeBathroom(
    userId: string | null,
    bathroomId: string,
    bathroomLikes: number,
    setLiked: React.Dispatch<React.SetStateAction<boolean>>,
    setLikes: React.Dispatch<React.SetStateAction<number>>,
    likes: number,
) {
  const res = await fetch('http://localhost:3000/user/likes', {
    method: 'delete',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userId,
      bathroomId,
    }),
  });

  if (res.ok) {
    setLiked(false);
    setLikes(likes - 1);
    bathroomLikes -= 1;
  } else {
    console.error('Error deleting like: ', res.statusText);
  }

  return;
}

/**
 * adds like to the bathroom
 * @param {string} userId user id
 * @param {string} bathroomId bathroom id
 * @param {number} bathroomLikes saved bathroom likes
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLiked liked setter
 * @param {React.Dispatch<React.SetStateAction<number>>} setLikes likes setter
 * @param {number} likes number of likes
 */
async function likeBathroom(
    userId: string | null,
    bathroomId: string,
    bathroomLikes: number,
    setLiked: React.Dispatch<React.SetStateAction<boolean>>,
    setLikes: React.Dispatch<React.SetStateAction<number>>,
    likes: number,
) {
  const res = await fetch('http://localhost:3000/user/likes', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      userId,
      bathroomId,
    }),
  });

  if (res.ok) {
    setLiked(true);
    setLikes(likes + 1);
    bathroomLikes += 1;
  } else {
    console.error('Error adding like: ', res.statusText);
  }

  return;
}

const Like = ({bathroom, userId, likes, setLikes}: LikeProps) => {
  const [liked, setLiked] = useState(false);
  useEffect(() => {
    /**
     * checks if user has liked the current bathroom
     */
    async function isLiked() {
      const likedBathrooms = await getLikedBathrooms(userId);
      setLiked(likedBathrooms.includes(bathroom.id));
    }

    if (userId) {
      isLiked();
    };
  }, [userId, bathroom.id]);

  const handleToggle = async () => {
    // update likes table
    if (liked) {
      await unlikeBathroom(
          userId,
          bathroom.id,
          bathroom.likes,
          setLiked,
          setLikes,
          likes,
      );
    } else {
      await likeBathroom(
          userId,
          bathroom.id,
          bathroom.likes,
          setLiked,
          setLikes,
          likes,
      );
    }
  };

  return (
    userId ?
    <div className='like-button'
      aria-label='like-button' onClick = {handleToggle}>
      {liked ?
        <FavoriteIcon color="error" aria-label={`Unlike ${bathroom.name}`}/> :
        <FavoriteBorderIcon aria-label={`Like ${bathroom.name}`}/>}
      <Typography color="textSecondary" className="like-number">
        {likes > 0 ? likes : null}
      </Typography>
    </div> :
    null
  );
};

export default Like;
