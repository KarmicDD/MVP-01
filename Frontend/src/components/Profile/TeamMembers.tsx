import React, { useMemo } from 'react';
import { FiPlus, FiTrash2, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { colours } from '../../utils/colours';

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
}

interface TeamMembersProps {
  members: TeamMember[];
  isEditing: boolean;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
  onMemberChange: (index: number, field: keyof TeamMember, value: string) => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({
  members,
  isEditing,
  onAddMember,
  onRemoveMember,
  onMemberChange
}) => {
  // Memoize member cards to prevent unnecessary re-renders
  const renderedMembers = useMemo(() =>
    members.map((member, index) => (
      <motion.div
        key={index}
        className={`border rounded-lg p-4 ${isEditing ? 'border-gray-300' : 'border-gray-200'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="flex-1 mr-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => onMemberChange(index, 'name', e.target.value)}
                  placeholder="Full Name"
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemoveMember(index)}
                className="text-red-500 hover:text-red-700 self-start mt-6"
              >
                <FiTrash2 />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={member.role}
                onChange={(e) => onMemberChange(index, 'role', e.target.value)}
                placeholder="Job Title"
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bio (optional)
              </label>
              <textarea
                value={member.bio || ''}
                onChange={(e) => onMemberChange(index, 'bio', e.target.value)}
                placeholder="Brief description"
                rows={2}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colours.indigo600} focus:ring-${colours.indigo600} sm:text-sm`}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FiUser className="text-gray-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">{member.name}</h4>
              <p className="text-xs text-gray-500">{member.role}</p>
              {member.bio && (
                <p className="mt-1 text-xs text-gray-600">{member.bio}</p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    )),
    [members, isEditing]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-800">Team Members</h3>
        {isEditing && (
          <button
            type="button"
            onClick={onAddMember}
            className={`inline-flex items-center px-2 py-1 text-sm font-medium text-${colours.indigo600} hover:text-${colours.indigo700} focus:outline-none`}
          >
            <FiPlus className="mr-1" />
            Add Team Member
          </button>
        )}
      </div>

      {members.length === 0 && !isEditing ? (
        <p className="text-gray-500 italic text-sm">No team members added</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderedMembers}
        </div>
      )}
    </div>
  );
};

export default React.memo(TeamMembers);
