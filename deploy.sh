if [[ `git status --porcelain` ]]; then
echo "****************"
echo "Please commit changes first"
echo "****************"
fi



yarn version --patch;
git com "version bump";
git pushme;
