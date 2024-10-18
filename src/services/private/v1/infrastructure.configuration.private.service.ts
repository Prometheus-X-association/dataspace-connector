import { InfrastructureConfiguration } from "../../../utils/types/infrastructureConfiguration";
import { IInfrastructureConfiguration } from "../../../utils/types/infrastructureConfiguration";

/**
 * Get all the infrastructure configurations
 * @returns 
 */
export const getInfrastructureConfigurationsService = async () => {
    const infrastructureConfigurations = await InfrastructureConfiguration.find().lean();
    return infrastructureConfigurations;
};

/**
 * Get a infrastructure configuration by id
 * @param infrastructureConfigurationId 
 * @returns 
 */
export const getInfrastructureConfigurationByIdService = async (infrastructureConfigurationId: string) => {
    const infrastructureConfiguration = await InfrastructureConfiguration.findById(infrastructureConfigurationId).lean();
    return infrastructureConfiguration;
};

/**
 * Create a infrastructure configuration
 * @param data 
 * @returns 
 */
export const createInfrastructureConfigurationService = async (data: IInfrastructureConfiguration) => {
    const infrastructureConfiguration = new InfrastructureConfiguration(data);
    await infrastructureConfiguration.save();
    return infrastructureConfiguration;
};

/**
 * Update a infrastructure configuration
 * @param infrastructureConfigurationId 
 * @param data 
 * @returns 
 */
export const updateInfrastructureConfigurationService = async (infrastructureConfigurationId: string, data: IInfrastructureConfiguration) => {
    const infrastructureConfiguration = await InfrastructureConfiguration.findByIdAndUpdate(infrastructureConfigurationId, data, { new: true });
    return infrastructureConfiguration;
};

/**
 * Delete a infrastructure configuration
 * @param infrastructureConfigurationId 
 * @returns 
 */
export const deleteInfrastructureConfigurationService = async (infrastructureConfigurationId: string) => {
    const infrastructureConfiguration = await InfrastructureConfiguration.findByIdAndDelete(infrastructureConfigurationId).lean();
    return infrastructureConfiguration;
};
