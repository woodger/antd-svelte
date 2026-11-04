import Skeleton from './Skeleton.svelte';
import Avatar from './SkeletonAvatar.svelte';
import Button from './SkeletonButton.svelte';
import Input from './SkeletonInput.svelte';
import Image from './SkeletonImage.svelte';
import Node from './SkeletonNode.svelte';

export default Object.assign(Skeleton, { Button, Avatar, Input, Image, Node });
